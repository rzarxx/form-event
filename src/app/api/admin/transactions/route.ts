import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data transaksi pembelian tiket
    const ticketTransactions = await prisma.transaction.findMany({
      include: {
        ticket: {
          select: { name: true, price: true }
        },
        event: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Ambil 100 terakhir
    });

    // Ambil data transaksi upgrade plan
    const subTransactions = await prisma.subscriptionTransaction.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Format data agar seragam untuk ditampilkan di tabel
    const formattedTransactions = [
      ...ticketTransactions.map(tx => ({
        id: tx.id,
        type: 'TICKET',
        reference: tx.paymentRef || tx.ticketCode,
        buyerName: tx.buyerName,
        buyerEmail: tx.buyerEmail,
        itemName: `Tiket: ${tx.ticket.name} - ${tx.event.title}`,
        amount: Number(tx.ticket.price), // Bisa ditambah platform fee jika perlu
        status: tx.paymentStatus,
        method: tx.paymentMethod || '-',
        createdAt: tx.createdAt
      })),
      ...subTransactions.map(tx => ({
        id: tx.id,
        type: 'SUBSCRIPTION',
        reference: tx.paymentRef || '-',
        buyerName: tx.user.name || 'User',
        buyerEmail: tx.user.email,
        itemName: `Upgrade: ${tx.plan} Plan`,
        amount: Number(tx.amount),
        status: tx.paymentStatus,
        method: tx.paymentMethod || '-',
        createdAt: tx.createdAt
      }))
    ];

    // Urutkan gabungan transaksi berdasarkan tanggal terbaru
    formattedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ data: formattedTransactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
