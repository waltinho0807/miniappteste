"use client";
import React from "react";
import { TonConnect, TonConnectButton, useTonConnectUI, useTonAddress, toUserFriendlyAddress } from "@tonconnect/ui-react";
import { toNano } from "@ton/ton"; // util para converter TON -> nanotons
import { useState, useEffect } from "react";



const RECEIVER = process.env.NEXT_PUBLIC_TON_RECEIVER!;

export default function TonPay({ telegramId, amountTon }: { telegramId: string, amountTon: string }) {
  // amountTon exemplo: "0.1"
  
  const [loading, setLoading] = useState(false);
  const [ tonConnectUI, setOptions ] = useTonConnectUI();

  const [addressUser, setAddressUser] = useState('');

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  //const [payer, setPayer] = useState("");
  const [message, setMessage] = useState("");

  const userFriendlyAddress = useTonAddress();
  const rawAddress = useTonAddress(false);

  const memoText = "MEU_MEMO_UNICO_12345";

  // Codifica para base64
  const memoBase64 = Buffer.from(memoText, "utf-8").toString("base64");


  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600, // 5 minutes
    messages: [
      {
        address:
          "0QDsvzjY3GbKhT9kon26B17LWi5UojhLfARtEDw980BvsTLL", // message destination in user-friendly format
        amount: "20000000", // Toncoin in nanotons
        payload: memoBase64
      },
    ],
  };

  const test = async () => {
    setAddressUser(userFriendlyAddress);
     return tonConnectUI.sendTransaction(transaction)
  }
  
  const testUser = async  (e: React.FormEvent) => {
    e.preventDefault();

     const payer = userFriendlyAddress;

     const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, firstName, payer }),
    });

    const data = await res.json();

    if (data.success) {
      setMessage("Usuário criado com sucesso!");
      setUsername("");
      setFirstName("");
      //setPayer("");
    } else {
      setMessage(data.error || "Erro ao criar usuário");
    }
  }

   useEffect(() => {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
  } else {
    console.log("App rodando fora do Telegram (modo dev)");
  }

  
}, []);



  return (
    <div>
      <TonConnectButton/>
      <h5>Testando outro tipo de button</h5>
      <button onClick={() => tonConnectUI.openModal()}>
        Conectar carteira
      </button>

     { userFriendlyAddress && (
      <div>
        <span>User-friendly address: {userFriendlyAddress}</span>
        <span>Raw address: {rawAddress}</span>
      </div>
      )}

      <button onClick={test}>
        Send transaction
      </button>
      {addressUser}
      <div>Salvar no banco com prisma</div>
      <form onSubmit={testUser} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="first name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Salvar Usuário
      </button>
      {message && <p>{message}</p>}
    </form>
    </div>
  );
}
