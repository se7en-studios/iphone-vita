"use client";

export function BenefitsMarquee() {
  const items = [
    { icon: "🎁", label: "Funda + Templado de REGALO en todos los iPhone nuevos" },
    { icon: "💵", label: "Aceptamos Pesos al tipo de cambio del día" },
    { icon: "🛡️", label: "Garantía Oficial Apple de 1 año en equipos sellados" },
    { icon: "🚀", label: "Envíos asegurados a todo el país" },
    { icon: "✨", label: "Equipos 100% Originales y Sellados" },
  ];

  return (
    <div className="relative z-50 overflow-hidden border-b border-[#ebd7be]/15 bg-[#050b18] py-2 text-xs text-[#ebd7be]">
      <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap px-4 font-medium tracking-wide">
        {[...items, ...items, ...items].map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-2">
            <span className="text-sm">{item.icon}</span>
            <span>{item.label}</span>
            <span className="text-white/20">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
