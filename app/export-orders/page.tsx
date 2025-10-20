"use client"

import { useState, useEffect } from "react"

interface Order {
    orderId: string;
    telegramId: string;
    username: string;
    payer: string | null;
    amountNano: string;
    status: string;
    memo: string | null;
    txHash: string | null;
    createdAt: string;
    expiresAt: string | null;
};

export default function ExportOrdersPage () {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/export-orders?status=PAID");
            const data = await res.json();
            setOrders(data.orders || []); 
             
        } catch (error) {
            console.error("Erro ao carregar ordens", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        window.location.href = "/api/export-orders";
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1>Ordens Pagas</h1>

            {loading && <p>Carregando...</p>}

            {!loading && orders.length === 0 && (
              <p>Nenhuma ordem com status PAID encontrada.</p>
            )}

            {!loading && orders.length > 0 && (
                <>
                    <table border={1} cellPadding={8} cellSpacing={0}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Telegram ID</th>
                                <th>Username</th>
                                <th>Payer</th>
                                <th>Amount Nano</th>
                                <th>Status</th>
                                <th>Txhash</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.orderId}>
                                    <td>{order.orderId}</td>
                                    <td>{order.telegramId}</td>
                                    <td>{order.username}</td>
                                    <td>{order.payer}</td>
                                    <td>{order.amountNano}</td>
                                    <td>{order.status}</td>
                                    <td>{order.txHash}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                      onClick={handleExportExcel}
                      style={{
                               marginTop: "20px",
                               backgroundColor: "#007bff",
                               color: "#fff",
                               padding: "10px 15px",
                               border: "none",
                               borderRadius: "5px",
                               cursor: "pointer",
                    }}> 
                        Exportar Ordems
                    </button>

                    
                </>
            )}
        </div>
    )
}