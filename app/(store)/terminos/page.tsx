import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPage,
  SellerData,
  type LegalSection,
} from "@/components/LegalPage";
import { REVOCATION_DAYS } from "@/lib/legal";

export const metadata: Metadata = { title: "Términos y condiciones" };

const SECTIONS: LegalSection[] = [
  {
    title: "Quiénes somos",
    body: (
      <>
        <p>
          iPhone Vita vende equipos Apple nuevos y sellados, equipos semi-nuevos
          revisados y accesorios. Estos son los datos del vendedor:
        </p>
        <SellerData />
      </>
    ),
  },
  {
    title: "Cómo se hace una compra",
    body: (
      <>
        <p>
          El sitio funciona como catálogo. Cuando elegís productos y tocás el
          botón de compra, se abre WhatsApp con tu pedido armado. La compra
          queda hecha recién cuando nosotros confirmamos stock y precio por
          WhatsApp y vos hacés el pago.
        </p>
        <p>
          Hasta ese momento podemos cambiar precios y stock, porque se
          actualizan varias veces por día. Si hay un error evidente en un precio
          publicado (por ejemplo, un cero de menos), te avisamos y podés
          confirmar al precio correcto o no seguir con la compra.
        </p>
      </>
    ),
  },
  {
    title: "Precios, dólares y pesos",
    body: (
      <>
        <p>
          Los precios se publican en dólares estadounidenses (USD). El valor en
          pesos que ves en el sitio es de referencia y se calcula con la
          cotización del día que figura en la barra superior.
        </p>
        <p>
          Si pagás en pesos, el monto final es el que te confirmamos por
          WhatsApp con la cotización del momento en que hacés la transferencia.
        </p>
      </>
    ),
  },
  {
    title: "Medios de pago",
    body: (
      <ul>
        <li>Dólares en efectivo, en billetes en buen estado.</li>
        <li>Transferencia bancaria en pesos, a la cotización confirmada.</li>
        <li>USDT (red TRC20 o BEP20).</li>
      </ul>
    ),
  },
  {
    title: "Envíos y retiro",
    body: (
      <>
        <p>
          Enviamos a todo el país por correo con seguimiento y seguro, o
          coordinamos una entrega en persona. El costo y el plazo te los
          informamos antes de pagar.
        </p>
        <p>
          Al recibir, revisá que la caja esté cerrada y sin golpes. Si ves algo
          raro, sacale una foto antes de abrirla y escribinos ese mismo día.
        </p>
      </>
    ),
  },
  {
    title: "Garantía",
    body: (
      <>
        <p>
          <strong className="text-fg">Equipos nuevos y sellados:</strong> tienen
          la garantía oficial de Apple por 1 año desde que se activan, válida en
          cualquier servicio técnico autorizado.
        </p>
        <p>
          <strong className="text-fg">Equipos semi-nuevos:</strong> tienen
          nuestra garantía por escrito. El plazo figura en el comprobante de
          compra y nunca es menor al mínimo legal para productos usados.
        </p>
        <p>
          La garantía no cubre golpes, humedad, pantallas rotas, equipos
          abiertos o reparados por terceros, ni el desgaste normal de la
          batería. Todo esto es además de la garantía legal que te da la Ley de
          Defensa del Consumidor (Ley 24.240), que no se puede limitar.
        </p>
      </>
    ),
  },
  {
    title: "Arrepentimiento de la compra",
    body: (
      <>
        <p>
          Tenés {REVOCATION_DAYS} días corridos para arrepentirte de la compra,
          sin dar motivos y sin costo. Se cuentan desde que recibís el producto.
          El producto tiene que volver como lo recibiste, con su caja y sus
          accesorios. Nosotros pagamos el envío de vuelta y te devolvemos el
          dinero por el mismo medio que usaste para pagar.
        </p>
        <p>
          Para hacerlo, usá el{" "}
          <Link href="/arrepentimiento">botón de arrepentimiento</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Plan Canje",
    body: (
      <>
        <p>
          El valor que muestra el simulador del sitio es una estimación. El
          valor final lo confirmamos cuando revisamos el equipo en persona.
        </p>
        <p>
          El equipo que entregás tiene que ser tuyo, sin reporte de robo o
          extravío, sin deuda con la compañía y con la cuenta de iCloud
          desvinculada. Si no cumple con esto, no lo podemos tomar.
        </p>
      </>
    ),
  },
  {
    title: "Regalos de la compra",
    body: (
      <p>
        La funda y el vidrio templado de regalo vienen con los iPhone nuevos y
        sellados. Si en algún momento no hay stock de un modelo de funda, te
        ofrecemos otro parecido.
      </p>
    ),
  },
  {
    title: "Reclamos",
    body: (
      <>
        <p>
          Ante cualquier problema, escribinos primero por WhatsApp: lo
          resolvemos más rápido.
        </p>
        <p>
          También podés hacer un reclamo ante{" "}
          <a
            href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
            target="_blank"
            rel="noopener noreferrer"
          >
            Defensa de las y los Consumidores
          </a>
          . Para cualquier disputa son competentes los tribunales del lugar
          donde vivís.
        </p>
      </>
    ),
  },
  {
    title: "Cambios en estos términos",
    body: (
      <p>
        Podemos actualizar estos términos. Cada compra se rige por los que
        estaban publicados el día en que la hiciste.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <LegalPage
      title="Términos y condiciones"
      intro="Estas son las reglas para comprar en iPhone Vita. Las escribimos simples a propósito: si algo no queda claro, preguntanos por WhatsApp."
      sections={SECTIONS}
    />
  );
}
