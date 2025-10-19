import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET (req: Request) {
    try {
        const url = new URL(req.url);
        const status = url.searchParams.get('status') || "PENDING";

        const orders = await prisma.order.findMany({
            where: { status },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, orders});
    } catch (error) {
        console.error("Erro ao buscar ordens:", error);
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
    }
}