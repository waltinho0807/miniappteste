"use client";

import { useState } from "react";

export default function CheckPaymentsPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckPayments = async () => {
    setLoading(true);
    setStatus("🔍 Verificando pagamentos na blockchain...");

    try {
      const res = await fetch("/api/check-payments");
      const data = await res.json();

      if (res.ok) {
        setStatus("✅ " + (data.message || "Pagamentos verificados com sucesso!"));
      } else {
        setStatus("❌ " + (data.error || "Erro ao verificar pagamentos"));
      }
    } catch (err) {
      console.error(err);
      setStatus("⚠️ Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
      <h1 className="text-2xl font-bold">Verificar Pagamentos TON</h1>

      <button
        onClick={handleCheckPayments}
        disabled={loading}
        className={`px-6 py-3 rounded text-white font-semibold transition ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Verificando..." : "Executar Verificação"}
      </button>

      {status && (
        <p
          className={`text-center ${
            status.startsWith("✅")
              ? "text-green-600"
              : status.startsWith("❌") || status.startsWith("⚠️")
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
