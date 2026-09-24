import type { ModelGroup } from "@/lib/products";
import { ModelCard } from "../ModelCard";
import { SectionHead } from "../ui/SectionHead";

export function MacSection({ groups }: { groups: ModelGroup[] }) {
  const [a, ...rest] = groups;
  return (
    <section className="bg-mist py-24 md:py-32">
      <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-8">
        <SectionHead eyebrow="Mac" title={<>Para trabajar.<br />Para crear. Para todo.</>} lede="MacBook Air con chip M5 y la nueva MacBook Neo." />
        <div className="grid gap-4 md:gap-5 lg:grid-cols-[1.25fr_1fr]">
          {a && (
            <div data-reveal className="h-full">
              <ModelCard group={a} stretch />
            </div>
          )}
          <div className="grid gap-4 md:gap-5">
            {rest.map((g) => (
              <div key={g.model} data-reveal>
                <ModelCard group={g} size="md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
