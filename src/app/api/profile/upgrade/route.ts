import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.plan === 'PRO') {
      return NextResponse.json({ error: 'User is already PRO' }, { status: 400 });
    }

    // Fetch pro plan price
    const systemSetting = await prisma.systemSetting.findUnique({
      where: { id: 'GLOBAL' },
    });

    const proPlanPrice = systemSetting?.proPlanPrice ? Number(systemSetting.proPlanPrice) : 99000;
    const amount = Math.round(proPlanPrice);

    // Tripay config
    const apiKey = process.env.TRIPAY_API_KEY;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE;

    if (!apiKey || !privateKey || !merchantCode) {
      return NextResponse.json({ error: 'Tripay configuration is missing' }, { status: 500 });
    }

    const merchantRef = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchantCode + merchantRef + amount)
      .digest('hex');

    // Default to QRIS if no method is specified since closed payment requires one
    const method = 'QRIS';

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: user.name || 'User',
      customer_email: user.email,
      customer_phone: user.phone || '080000000000',
      order_items: [
        {
          name: "Pro Plan Upgrade",
          price: amount,
          quantity: 1,
        }
      ],
      signature,
    };

    const tripayResponse = await fetch('https://tripay.co.id/api-sandbox/transaction/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const tripayData = await tripayResponse.json();

    if (!tripayResponse.ok || !tripayData.success) {
      console.error('Tripay Create Transaction Error:', tripayData);
      return NextResponse.json({ error: 'Failed to create transaction with payment gateway' }, { status: 400 });
    }

    // Create subscription transaction
    const transaction = await prisma.subscriptionTransaction.create({
      data: {
        userId,
        plan: 'PRO',
        amount: amount,
        paymentStatus: 'PENDING',
        paymentMethod: method,
        paymentRef: tripayData.data.reference, // Tripay Reference
        checkoutUrl: tripayData.data.checkout_url,
      },
    });

    return NextResponse.json({ success: true, checkoutUrl: tripayData.data.checkout_url });
  } catch (error) {
    console.error('Error in profile upgrade route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
