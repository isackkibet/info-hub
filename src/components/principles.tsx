const principles = [
  {
    title: "Built for the field",
    detail:
      "Simple, fast forms that work well on an ordinary phone, even with a weak connection.",
    accent: "forest",
  },
  {
    title: "Evidence, not just claims",
    detail:
      "Every report needs something behind it: a photo, a location, a link, or a count.",
    accent: "lake",
  },
  {
    title: "Checked before it counts",
    detail:
      "A record only becomes verified after a real person reviews it, not just an automatic check.",
    accent: "forest",
  },
  {
    title: "Always traceable",
    detail:
      "Every record shows who submitted it, where, when, and who confirmed it.",
    accent: "lake",
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

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className={
                "flex flex-col rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5 border-l-4 " +
                (principle.accent === "forest"
                  ? "border-l-forest-600"
                  : "border-l-lake-600")
              }
            >
              <h3 className="text-base font-semibold text-ink-900">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {principle.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
