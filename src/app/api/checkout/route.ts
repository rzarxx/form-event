import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventId, ticketId, buyerName, buyerEmail, buyerPhone, method, formData } = body;

    if (!eventId || !ticketId || !buyerName || !buyerEmail || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!event || !ticket) {
      return NextResponse.json({ error: 'Event or Ticket not found' }, { status: 404 });
    }

    const systemSetting = await prisma.systemSetting.findUnique({
      where: { id: 'GLOBAL' },
    });

    const platformFee = systemSetting?.platformFee ? Number(systemSetting.platformFee) : 0;
    const ticketPrice = Number(ticket.price);
    const amount = Math.round(ticketPrice + platformFee);

    const apiKey = process.env.TRIPAY_API_KEY;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;
    const merchantCode = process.env.TRIPAY_MERCHANT_CODE;

    if (!apiKey || !privateKey || !merchantCode) {
      return NextResponse.json({ error: 'Tripay configuration is missing' }, { status: 500 });
    }

    const merchantRef = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const signature = crypto
      .createHmac('sha256', privateKey)
      .update(merchantCode + merchantRef + amount)
      .digest('hex');

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: buyerName,
      customer_email: buyerEmail,
      customer_phone: buyerPhone || '',
      order_items: [
        {
          name: ticket.name,
          price: ticketPrice,
          quantity: 1,
        },
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

    // Create transaction in pending state
    const randomTicketCode = `TCK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const transaction = await prisma.transaction.create({
      data: {
        eventId,
        ticketId,
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone || '',
        paymentStatus: 'PENDING',
        paymentMethod: method,
        paymentRef: tripayData.data.reference, // Tripay Reference
        ticketCode: randomTicketCode,
        qrSignature: 'PENDING', // Will update after success
        formData: formData || {},
      },
    });

    return NextResponse.json({ success: true, checkoutUrl: tripayData.data.checkout_url });
  } catch (error) {
    console.error('Error in checkout route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
