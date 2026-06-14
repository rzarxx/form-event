import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-callback-signature');

    const privateKey = process.env.TRIPAY_PRIVATE_KEY;

    if (!privateKey) {
      return NextResponse.json({ error: 'Tripay configuration is missing' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', privateKey)
      .update(rawBody)
      .digest('hex');

    if (signatureHeader !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(rawBody);

    if (data.status === 'PAID' || data.status === 'SUCCESS') {
      const paymentRef = data.reference;

      const transaction = await prisma.transaction.findFirst({
        where: { paymentRef },
      });

      if (transaction && transaction.paymentStatus !== 'SUCCESS') {
        const ticketCode = transaction.ticketCode;
        
        // Generate a real qrSignature (e.g., HMAC of ticketCode)
        const qrSignature = crypto
          .createHmac('sha256', privateKey)
          .update(ticketCode)
          .digest('hex');

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: 'SUCCESS',
            qrSignature,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in Tripay callback route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
