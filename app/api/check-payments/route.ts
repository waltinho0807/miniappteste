import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TonClient, Address, beginCell } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

// ⚠️ friendly (o seu, como você está usando no app)
const RECEIVER_ADDRESS_FRIENDLY = "0QDsvzjY3GbKhT9kon26B17LWi5UojhLfARtEDw980BvsTLL";

// ————————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————————

/**
 * Dado um memo salvo no banco, retorna o payload BOC/base64 esperado.
 * - Se o memo parecer um UUID (tem “-”), codifica como Cell e retorna em base64
 * - Se já for base64 (ordens novas), retorna como está
 */
function toExpectedPayloadBase64(dbMemo: string): string {
  const looksUUID = dbMemo.includes("-") && dbMemo.length >= 30 && dbMemo.length <= 50;
  if (looksUUID) {
    // compat com ordens antigas: converte o UUID para o mesmo formato que a carteira envia
    const cell = beginCell()
      .storeUint(0, 32)            // você usou essa tag ao enviar: mantenho aqui
      .storeStringTail(dbMemo)
      .endCell();
    return cell.toBoc().toString("base64");
  }
  // ordens novas: já está em base64 (Cell.toBoc().toString("base64"))
  return dbMemo;
}

/** Compara valores em nanotons de forma segura */
function gteBigInt(a: string | number | bigint, b: string | number | bigint) {
  return BigInt(a) >= BigInt(b);
}

// ————————————————————————————————————————————————
// Handler
// ————————————————————————————————————————————————
export async function GET() {
  try {
    // 1) Buscar ordens pendentes
    const pendingOrders = await prisma.order.findMany({
      where: { status: "PENDING" },
    });

    if (pendingOrders.length === 0) {
      return NextResponse.json({ message: "Nenhuma ordem pendente." });
    }

    // 2) Cliente TON (TESTNET!)
    //const endpoint = await getHttpEndpoint({ network: "testnet" });
    //console.log("✅ TON endpoint:", endpoint);
    //const client = new TonClient({ endpoint });

    const client = new TonClient({
      endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    });

    // 3) Converter endereço friendly -> raw (o que funcionou no seu ambiente)
    let recv;
    try {
      recv = Address.parseFriendly(RECEIVER_ADDRESS_FRIENDLY).address;
      console.log("✅ Endereço (raw):", recv.toString());
    } catch (e) {
      console.error("❌ Endereço inválido (friendly):", e);
      return NextResponse.json({ error: "Endereço inválido" }, { status: 400 });
    }

    // 4) Trazer transações recentes
    let transactions;
    try {
      transactions = await client.getTransactions(recv, { limit: 50 });
      console.log("🔍 Transações:", transactions.length);
    } catch (e) {
      console.error("❌ Erro ao buscar transações:", e);
      return NextResponse.json({ error: "Falha ao consultar a blockchain" }, { status: 500 });
    }

    // 5) Verificar cada ordem
    let paidCount = 0;

    for (const order of pendingOrders) {
      try {
        const expectedPayloadBase64 = toExpectedPayloadBase64(order.memo || "");
        const expectedAmount = order.amountNano;

        console.log("—");
        console.log(`➡ Verificando ordem ${order.orderId}`);
        console.log("expectedPayloadBase64 (DB):", expectedPayloadBase64.slice(0, 32) + "…");
        console.log("expectedAmount (DB):", expectedAmount);

        // procurar uma tx que bata payload e valor
        const match = transactions.find((tx: any, idx: number) => {
          const inMsg = tx.inMessage;
          if (!inMsg) return false;

          const info = inMsg.info;
          if (!info || info.type !== "internal") return false;

          const payer = info.src?.toString() || "";
          const amount = info.value?.coins?.toString() || "0";

          // body (Cell) -> BOC/base64
          const bodyCell = inMsg.body;
          const txPayloadBase64 = bodyCell ? bodyCell.toBoc().toString("base64") : "";

          // Logs de comparação (resumo)
          console.log(`[TX ${idx}] payer: ${payer}`);
          console.log(`[TX ${idx}] amount: ${amount}`);
          console.log(
            `[TX ${idx}] txPayloadBase64: ${
              txPayloadBase64 ? txPayloadBase64.slice(0, 32) + "…" : "(vazio)"
            }`
          );

          const ok =
            txPayloadBase64 === expectedPayloadBase64 &&
            gteBigInt(amount, expectedAmount);

          console.log(`[TX ${idx}] match?`, ok);
          return ok;
        });

        if (match) {
          await prisma.order.update({
            where: { orderId: order.orderId },
            data: {
              status: "PAID",
              txHash: match.hash().toString("base64"),
              payer: match.inMessage?.info?.src?.toString() || null,
            },
          });
          paidCount += 1;
          console.log(`✅ Ordem ${order.orderId} marcada como PAID`);
        } else {
          console.log(`⚠️ Nenhuma tx correspondente para ${order.orderId}`);
        }
      } catch (e) {
        console.error(`❌ Erro processando ordem ${order.orderId}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pagamentos verificados. Atualizadas: ${paidCount}.`,
    });
  } catch (error: any) {
    console.error("❌ Erro ao verificar pagamentos (top-level):", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno" },
      { status: 500 }
    );
  }
}
