import type { Metadata } from "next";
import {
  LegalPage,
  SellerData,
  type LegalSection,
} from "@/components/LegalPage";

export const metadata: Metadata = { title: "Política de privacidad" };

const SECTIONS: LegalSection[] = [
  {
    title: "Quién es responsable de tus datos",
    body: (
      <>
        <p>El responsable de los datos que nos das es iPhone Vita:</p>
        <SellerData />
      </>
    ),
  },
  {
    title: "Qué datos usamos",
    body: (
      <>
        <p>
          <strong className="text-fg">En el sitio:</strong> no tenés que crear
          una cuenta ni dejar tus datos. El carrito se guarda solo en tu
          navegador y no nos llega. No usamos cookies de publicidad ni de
          seguimiento. El servicio de hosting registra datos técnicos básicos,
          como tu dirección IP, para que el sitio funcione y sea seguro.
        </p>
        <p>
          <strong className="text-fg">Cuando nos escribís o comprás:</strong>{" "}
          usamos lo que nos mandás por WhatsApp. Por ejemplo, tu nombre, tu
          teléfono, la dirección de envío, los datos de tu pago y, si usás el
          Plan Canje, los datos del equipo que entregás.
        </p>
      </>
    ),
  },
  {
    title: "Para qué los usamos",
    body: (
      <ul>
        <li>Responder tus consultas y armar tu pedido.</li>
        <li>Cobrar, enviar el producto y darte la garantía.</li>
        <li>Llevar el registro de ventas que nos exige la ley.</li>
      </ul>
    ),
  },
  {
    title: "Con quién los compartimos",
    body: (
      <>
        <p>
          No vendemos ni alquilamos tus datos. Solo los compartimos con quienes
          necesitamos para venderte:
        </p>
        <ul>
          <li>La empresa de correo, para hacer el envío.</li>
          <li>WhatsApp (Meta), que es por donde nos comunicamos.</li>
          <li>Los servicios donde está alojado el sitio y su base de datos.</li>
          <li>Organismos públicos, solo si la ley nos lo exige.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Cuánto tiempo los guardamos",
    body: (
      <p>
        Los datos de una venta los guardamos mientras dure la garantía y el
        tiempo que exigen las normas contables e impositivas. Las consultas que
        no terminan en una compra no las guardamos más de lo necesario para
        responderte.
      </p>
    ),
  },
  {
    title: "Tus derechos",
    body: (
      <>
        <p>
          Podés pedirnos ver qué datos tuyos tenemos, corregirlos o borrarlos.
          Escribinos por WhatsApp o por email y te respondemos. Pedir acceso a
          tus datos es gratis, cada seis meses (Ley 25.326 de Protección de
          Datos Personales).
        </p>
        <p>
          Si no te respondemos o la respuesta no te convence, podés reclamar
          ante la{" "}
          <a
            href="https://www.argentina.gob.ar/aaip/datospersonales"
            target="_blank"
            rel="noopener noreferrer"
          >
            Agencia de Acceso a la Información Pública
          </a>
          , que es el organismo que controla el cumplimiento de esta ley.
        </p>
      </>
    ),
  },
  {
    title: "Cambios en esta política",
    body: (
      <p>
        Si cambiamos esta política, publicamos la versión nueva en esta página
        con la fecha de actualización.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro="Qué datos tuyos usamos, para qué, y cómo nos podés pedir que los corrijamos o los borremos."
      sections={SECTIONS}
    />
  );
}
