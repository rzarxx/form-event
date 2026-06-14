import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.TRIPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Tripay API Key is not configured' }, { status: 500 });
    }

    const response = await fetch('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tripay API Error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch payment channels' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tripay channels route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
