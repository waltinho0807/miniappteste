"use client";

import { useState } from "react";

export default function ExpireOrdersPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExpireOrders = async () => {
    setLoading(true);
    setMessage("Verificando ordens expiradas...");

    try {
      const res = await fetch("/api/expired-orders", { method: "GET" });
      const data = await res.json();

      if (data.success) {
        setMessage(
          `✅ ${data.updatedCount} ordem(ns) foram marcadas como EXPIRED.`
        );
      } else {
        setMessage("⚠️ Nenhuma ordem expirada encontrada ou erro na operação.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        alignItems: "center",
      }}
    >
      <h1>Verificar Ordens Expiradas</h1>

      <button
        onClick={handleExpireOrders}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#999" : "#d9534f",
          color: "#fff",
          padding: "10px 16px",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px",
        }}
      >
        {loading ? "Processando..." : "Expirar Ordens"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
