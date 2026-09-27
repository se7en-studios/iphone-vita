import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = { title: "Carrito" };

export default function CarritoPage() {
  return (
    <div className="store">
      <CartPageView />
    </div>
  );
}
