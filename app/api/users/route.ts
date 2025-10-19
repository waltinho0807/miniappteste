import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { username, firstName, payer } = await req.json();
        if (!username) {
            return NextResponse.json({ error: "username é obrigatório" }, { status: 400 });
        }

        const user = await prisma.teste.create({
            data: {
                username,
                firstName,
                payer
            }
        });

        return NextResponse.json({ success: true, user });


    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}