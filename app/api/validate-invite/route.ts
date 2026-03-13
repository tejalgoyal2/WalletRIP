import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code } = await req.json();

  const inviteCode = process.env.INVITE_CODE;
  if (!inviteCode) {
    return NextResponse.json({ error: 'Invite code not configured.' }, { status: 500 });
  }

  if (!code || code !== inviteCode) {
    return NextResponse.json({ error: 'Invalid Invite Code' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
