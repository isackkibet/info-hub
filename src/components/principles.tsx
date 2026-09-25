const principles = [
  {
    title: "Built for the field",
    detail: "Works well on an ordinary phone, even on a weak connection.",
  },
  {
    title: "Evidence, not just claims",
    detail: "Every report needs a photo, a location, a link, or a count behind it.",
  },
  {
    title: "Checked before it counts",
    detail: "A real person reviews it before it counts as verified.",
  },
  {
    title: "Always traceable",
    detail: "Every record shows who submitted it, when, and who confirmed it.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            How it works
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Built around a few simple rules
          </h2>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {principles.map((principle, index) => (
            <div key={principle.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-100 text-sm font-semibold text-forest-700">
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold text-ink-900">
                  {principle.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  {principle.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
