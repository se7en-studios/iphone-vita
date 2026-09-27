import Image from "next/image";
import { CountUp } from "../ui/CountUp";

const SPECS = [
  {
    value: "48 MP",
    label:
      "en las tres cámaras traseras: principal, ultra gran angular y teleobjetivo.",
  },
  {
    value: "8x",
    label: "de zoom con calidad óptica, y un rango de 16x en total.",
  },
  {
    value: "4K 120",
    label: "cuadros por segundo en Dolby Vision, con ProRes y Apple Log 2.",
  },
];

/** Deep-dive de cámara con cifras grandes, estilo página de specs de Apple. */
export function CameraSection() {
  return (
    <section
      id="camara"
      className="scroll-mt-28 border-t border-white/10 bg-black py-16 text-white md:py-40"
    >
      <div
        data-reveal
        className="mx-auto max-w-[980px] px-4 text-center md:px-8"
      >
        <p className="text-lg font-semibold text-[#ebd7be] md:text-xl">
          Cámara
        </p>
        <h2 className="mt-3 text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
          Una cámara Pro de verdad.
        </h2>
        <p className="mx-auto mt-6 max-w-[56ch] text-lg text-white/60 md:text-xl">
          La cámara Fusion principal ahora tiene apertura variable, de ƒ/1.48 a
          ƒ/4.0. Más luz cuando hace falta y el fondo tan desenfocado como
          quieras.
        </p>
      </div>

      <div
        className="scroll-zoom relative mx-auto mt-10 aspect-[337/195] md:mt-16 w-full max-w-[520px] px-4"
      >
        <Image
          src="/images/highlights/main-camera.jpg"
          alt="Sistema de cámaras trasero del iPhone 18 Pro"
          fill
          sizes="520px"
          className="object-contain [mask-image:linear-gradient(to_bottom,transparent,black_35%)]"
        />
      </div>

      <dl data-stagger className="mx-auto mt-12 grid max-w-5xl gap-8 px-4 md:mt-20 md:grid-cols-3 md:gap-10 md:px-8">
        {SPECS.map((s) => (
          <div key={s.value} className="text-center md:text-left">
            <dt className="tabular text-[clamp(3rem,7vw,5.5rem)] font-bold leading-none tracking-[-0.04em] text-white">
              <CountUp value={s.value} />
            </dt>
            <dd className="mx-auto mt-4 max-w-[30ch] text-[17px] leading-relaxed text-white/60 md:mx-0">
              {s.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
