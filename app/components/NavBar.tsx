"use client";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="flex gap-4 p-4 bg-gray-200">
      <Link href="/">Home</Link>
      <Link href="/teste-order">Create Order</Link>
      <Link href="/payments">Payments</Link>
      <Link href="/check-payments">Check Payments</Link>
      <Link href="/expired-ordes">Check Payments</Link>
      <Link href="/export-ordes">Check Payments</Link>
    </nav>
  );
}