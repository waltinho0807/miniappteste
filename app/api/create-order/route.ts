import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { telegramId, payer } = await req.json();

    if (!telegramId) {
      return NextResponse.json({ error: "telegramId é obrigatório" }, { status: 400 });
    }

    const orderId = uuidv4();
    const memo = uuidv4(); // memo único
    const amountNano = "200000000"; // 0.2 TON em nanotons
    const expires = new Date(Date.now() + 1000 * 60 * 20); // expira em 20 minutos

    const order = await prisma.order.create({
      data: {
        orderId,
        telegramId,
        payer,
        amountNano,
        memo,
        status: "PENDING",
        expiresAt: expires,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Erro ao criar ordem:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
