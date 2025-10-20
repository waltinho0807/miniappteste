import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET() {
    try {
        const paidOrders = await prisma.order.findMany({
            where: {status: "PAID"}
        });

        if (!paidOrders || paidOrders.length === 0) {
          return NextResponse.json({ message: "Nenhuma ordem paga encontrada." });
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Paid orders");

        worksheet.columns = [
            { header:"Order ID",key:"orderId",width: 32 },
            { header:"Telegram ID",key:"telegramId",width: 20 },
            { header:"Username",key:"username",width: 25 },
            { header:"Payer",key:"payer",width: 35 },
            { header:"Amount",key:"amountNano",width: 15 },
            { header:"Status",key:"status",width: 12 },
            { header:"Memo",key:"memo",width: 50 },
            { header:"Tx hash",key:"txHash",width: 50 },
            { header:"Created At",key:"createdAt",width: 25 },
            { header:"Expires At",key:"expiresAt",width: 25 } 
        ];

         paidOrders.forEach((order) => {
          worksheet.addRow({
            orderId: order.orderId,
            telegramId: order.telegramId,
            username: order.username,
            payer: order.payer,
            amountNano: order.amountNano,
            status: order.status,
            memo: order.memo,
            txHash: order.txHash,
            createdAt: order.createdAt?.toISOString() ?? "",
            expiresAt: order.expiresAt?.toISOString() ?? "",
          });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=paid-orders.xlsx",
            }
        })
    } catch (error) {
        console.error("Erro ao exportar Excel:", error);
        return NextResponse.json(
          { error: "Erro ao exportar arquivo" },
          { status: 500 }
        );
    }
}