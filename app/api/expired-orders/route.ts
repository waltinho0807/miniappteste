import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // Busca ordens pendentes com prazo vencido
    const expiredOrders = await prisma.order.updateMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Ordens expiradas atualizadas.`,
      updatedCount: expiredOrders.count,
    });
  } catch (error) {
    console.error("Erro ao expirar ordens:", error);
    return NextResponse.json(
      { error: "Erro interno ao expirar ordens" },
      { status: 500 }
    );
  }
}
