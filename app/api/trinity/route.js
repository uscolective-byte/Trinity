import { NextResponse } from 'next/server';
import { processTrinityStep } from '@/core/orchestrator';

export async function POST(request) {
  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: "Chýba parameter 'input'." }, { status: 400 });
    }

    const result = processTrinityStep(input);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ status: "OK", data: result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Interná chyba servera." }, { status: 500 });
  }
}
