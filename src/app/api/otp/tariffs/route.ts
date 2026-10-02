import { NextRequest, NextResponse } from 'next/server';
import { getOnlineSimTariffs, POPULAR_COUNTRIES } from '@/lib/onlinesim';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country') || '1';

    const services = await getOnlineSimTariffs(country);

    return NextResponse.json({
      success: true,
      countries: POPULAR_COUNTRIES,
      services,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
