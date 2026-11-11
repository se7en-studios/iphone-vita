import { notFound } from "next/navigation";

// Las URLs que no existen caen acá para mostrar el 404 con la navbar y el footer de la tienda.
export default function CatchAll() {
  notFound();
}
