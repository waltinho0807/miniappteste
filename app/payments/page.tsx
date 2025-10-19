"use client";

import { useEffect, useState } from "react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { beginCell } from "@ton/ton";

export default function PaymentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders?status=PENDING");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error("Erro ao buscar ordens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handlePay = async (order: any) => {
    try {
      const cell = beginCell().storeUint(0, 32).storeStringTail(order.memo).endCell();
      const payloadBase64 = cell.toBoc().toString("base64");
      console.log(payloadBase64)
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 min
        messages: [
          {
            address: "0QDsvzjY3GbKhT9kon26B17LWi5UojhLfARtEDw980BvsTLL",
            amount: order.amountNano, // valor em nanotons
            payload: payloadBase64, // memo único da ordem
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);
    } catch (error) {
      console.error("Erro ao enviar transação:", error);
      alert("Falha ao enviar pagamento via TON.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 gap-4">
      <h1 className="text-2xl font-bold mb-4">Ordens Pendentes</h1>

      <TonConnectButton />

      {loading ? (
        <p>Carregando ordens...</p>
      ) : orders.length === 0 ? (
        <p>Nenhuma ordem pendente encontrada.</p>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-md">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="border rounded p-3 shadow-md flex flex-col gap-1 bg-white"
            >
              <p><strong>Order ID:</strong> {order.orderId}</p>
              <p><strong>Memo:</strong> {order.memo}</p>
              <p><strong>Valor:</strong> {Number(order.amountNano) / 1e9} TON</p>
              <button
                onClick={() => handlePay(order)}
                className="mt-2 bg-green-600 hover:bg-green-700 text-white rounded p-2"
              >
                💸 Pagar com TON
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
