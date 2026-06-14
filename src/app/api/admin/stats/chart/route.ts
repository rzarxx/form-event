import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate last 7 days array
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      // Revenue from ticket transactions
      const ticketTx = await prisma.transaction.findMany({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: {
            gte: d,
            lt: nextD,
          }
        },
        include: { ticket: true }
      });
      
      // Revenue from subscription upgrades
      const subTx = await prisma.subscriptionTransaction.findMany({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: {
            gte: d,
            lt: nextD,
          }
        }
      });

      const dailyRevenue = 
        ticketTx.reduce((sum, tx) => sum + Number(tx.ticket.price), 0) +
        subTx.reduce((sum, tx) => sum + Number(tx.amount), 0);

      const dailyUsers = await prisma.user.count({
        where: {
          role: { not: 'SUPER_ADMIN' },
          createdAt: {
            gte: d,
            lt: nextD,
          }
        }
      });

      data.push({
        name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        date: d.toISOString().split('T')[0],
        revenue: dailyRevenue,
        users: dailyUsers
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching chart stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
