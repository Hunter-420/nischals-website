import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";

export const metadata = {
  title: 'What I Aim to be | Nischal Khanal',
  description: 'Areas of focus and engineering goals in systems, market infrastructure, and performance.',
};

const aims = [
  {
    title: "Understanding Systems",
    items: [
      "How machines communicate across networks.",
      "How operating systems manage resources and workloads.",
      "How distributed systems behave under scale, failure, and load.",
      "How bottlenecks emerge and how they can be measured.",
    ]
  },
  {
    title: "Understanding Performance",
    items: [
      "Where latency originates inside a system.",
      "The tradeoffs between throughput, reliability, and speed.",
      "How hardware, software, and network decisions affect outcomes.",
      "Why performance optimization is often about removing constraints rather than adding complexity.",
    ]
  },
  {
    title: "Understanding Markets",
    items: [
      "How exchanges process and match orders.",
      "How market data is generated and distributed.",
      "How liquidity, spreads, and execution influence trading outcomes.",
      "How infrastructure creates advantages in competitive environments.",
    ]
  },
  {
    title: "Building Technical Depth",
    items: [
      "Developing strong foundations in C++, Python, Linux, and networking.",
      "Building projects that move beyond tutorials and expose real engineering challenges.",
      "Learning through experimentation, measurement, debugging, and iteration.",
      "Understanding systems from implementation details to architectural decisions.",
    ]
  },
  {
    title: "Becoming a Better Engineer",
    items: [
      "Thinking in systems rather than isolated technologies.",
      "Approaching problems with curiosity instead of assumptions.",
      "Becoming comfortable with ambiguity and difficult problems.",
      "Building the habit of continuous learning and independent exploration.",
    ]
  }
];

export default function WhatIBringPage() {
  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">What I Aim to be</h1>
        </header>

        <section className="flex flex-col gap-10 max-w-2xl">
          {aims.map((aim, idx) => (
            <div key={idx} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{aim.title}</h2>
              <ul className="flex flex-col gap-3">
                {aim.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-4 text-gray-900 dark:text-gray-100 font-normal leading-[1.8]">
                    <span className="flex-shrink-0 mt-[10px] w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>
    </Container>
  );
}
