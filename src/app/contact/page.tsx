import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import { Mail, MapPin, Laptop, FileText } from "lucide-react";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const revalidate = 60;

export const metadata = {
  title: "Contact",
  description: "Get in touch with Nischal Khanal. Currently interested in Systems & Infrastructure roles.",
  alternates: {
    canonical: "https://khanalnischal.com.np/contact",
  },
};

export default async function ContactPage() {
  await connectToDatabase();
  const settings = (await SiteSettings.findOne().lean()) as any;
  const links = settings?.socialLinks || {};
  const resumeUrl = settings?.resumeUrl;

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12 max-w-2xl">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Contact</h1>
          <p className="text-black font-normal text-base leading-relaxed">
            I am currently <strong className="text-black ">{settings?.openToWorkText?.toLowerCase() || 'interested in systems & infrastructure roles'}</strong>. 
            Whether you have an opportunity or just want to say hi, feel free to reach out.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-black ">Availability</h2>
            <ul className="flex flex-col gap-4 text-sm text-slate-700 ">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <span>Open to Full-time</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>Remote / Hybrid / On-site</span>
              </li>
              {resumeUrl && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors">
                    View my Resume &rarr;
                  </a>
                </li>
              )}
            </ul>
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-black ">Connect</h2>
            <ul className="flex flex-col gap-4 text-sm text-slate-700 ">
              {links.email && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href={`mailto:${links.email}`} className="hover:text-blue-600 hover:underline transition-colors">
                    {links.email}
                  </a>
                </li>
              )}
              {links.linkedin && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <LinkedinIcon className="w-4 h-4" />
                  </div>
                  <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors">
                    LinkedIn
                  </a>
                </li>
              )}
              {links.github && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                    <GithubIcon className="w-4 h-4" />
                  </div>
                  <a href={links.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline transition-colors">
                    GitHub
                  </a>
                </li>
              )}
            </ul>
          </section>
        </div>
      </main>
    </Container>
  );
}
