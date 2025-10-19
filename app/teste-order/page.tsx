"use client"
import { useState, useEffect } from "react";

export default function TesteOrder () {
    const [telegramId, setTelegramId] = useState("")
    const [username, setUsername] = useState("");

    useEffect (() => {
        if(typeof window !== "undefined" && window.Telegram?.WebApp){
            const user = window.Telegram.WebApp.initDataUnsafe?.user;
            if(user){
                setTelegramId(String(user.id));
                setUsername(user.username || "");
            }
        }
    }, []);

    const handleCreateOrder = async () => {
        const res = await fetch("/api/create-order", {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({
                telegramId,
                username,
                payer: ""
            })
            
        });

        const data = await res.json();
        console.log(data);
    } 

    return (
        <div>
          <h1>Teste Ordem</h1>
          <p>TelegramId: {telegramId}</p>
          <p>Username: {username}</p>

          <button onClick={handleCreateOrder}>
            Criar ordem com dados do Telegram
          </button>
        </div>
      );
}