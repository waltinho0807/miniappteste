"use client";

import { useTonAddress } from "@tonconnect/ui-react";
import { useState } from "react";


export default function CreateOrderPage() {
  const [telegramId, setTelegramId] = useState("");
  const [message, setMessage] = useState("");

  const userFriendlyAddress = useTonAddress();

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("Criando ordem...");
    try {
      
      const payer = userFriendlyAddress;
      
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId, payer }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(`✅ Ordem criada com sucesso! Memo: ${data.order.memo}`);
      } else {
        setMessage(`❌ Erro: ${data.error || "Falha ao criar ordem"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h1 className="text-2xl font-bold">Criar Ordem</h1>
      <form onSubmit={handleCreateOrder} className="flex flex-col gap-2 w-64">
        <input
          type="text"
          placeholder="Telegram ID"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
          className="border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2"
        >
          Criar Ordem
        </button>
      </form>
      {message && <p className="mt-2 text-center">{message}</p>}
    </div>
  );
}
