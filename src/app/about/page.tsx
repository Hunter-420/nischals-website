import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

export const revalidate = 60;

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

async function getAboutData() {
  await connectToDatabase();
  const settings = await SiteSettings.findOne().lean();
  return { settings: settings as any };
}

export default async function AboutPage() {
  const { settings } = await getAboutData();

  return (
    <Container>
      <Navigation />
      
      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">About me</h1>
          <h2 className="text-xl text-gray-700 dark:text-gray-300">
            {settings?.title || 'Nischal Khanal'}
          </h2>
        </header>

        <section className="prose prose-zinc dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 font-normal leading-[1.8]">
          <p className="font-medium text-lg">
            {settings?.description || 'Software Engineer exploring systems, market infrastructure, and performance engineering.'}
          </p>

          {settings?.aboutText ? (
            <p>
              {settings.aboutText}
            </p>
          ) : (
            <>
              <p>
                My interests sit at the intersection of networking, operating systems, distributed systems, and modern market infrastructure. I&apos;m currently focused on understanding how information moves through systems, how bottlenecks emerge, and how engineering decisions influence performance under real-world constraints.
              </p>
              <p>
                This website documents what I&apos;m building, what I&apos;m learning, and the questions I&apos;m trying to answer.
              </p>
            </>
          )}

          <h3 className="text-xl font-semibold mt-8 mb-6">What I Aim to be</h3>
          
          <div className="flex flex-col gap-8 not-prose">
            {aims.map((aim, idx) => (
              <div key={idx} className="flex flex-col gap-3">
                <h4 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">{aim.title}</h4>
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
          </div>
        </section>
      </main>
    </Container>
  );
}
