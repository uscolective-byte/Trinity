import { NextResponse } from 'next/server';
import { processTrinityStep } from '@/core/orchestrator';

export async function POST(request) {
  try {
    const body = await request.json();
    const input = body?.input;

    if (typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ error: "Parameter 'input' musí byť neprázdny text." }, { status: 400 });
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
