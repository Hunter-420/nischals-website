import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import ResumeDownloadButton from "@/components/ui/ResumeDownloadButton";

export const revalidate = 60;

async function getResumeData() {
  await connectToDatabase();
  const settings = await SiteSettings.findOne().lean() as any;
  return {
    resumeUrl: settings?.resumeUrl || null,
    resumeExperience: settings?.resumeExperience || null,
  };
}

export default async function ResumePage() {
  const { resumeUrl, resumeExperience } = await getResumeData();

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Resume</h1>
              <p className="text-gray-900 dark:text-gray-100 font-normal leading-[1.8] mt-1">
                My professional experience and background.
              </p>
            </div>
            {/* We will center the actions below instead */}
          </div>
        </header>

        {resumeUrl ? (
          <section className="flex flex-col items-center justify-center gap-8 py-20 mt-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ready for review</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                Get the full overview of my experience, education, and technical skills.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <span>View Online</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <div className="w-full sm:w-auto [&>button]:w-full [&>button]:sm:w-auto [&>button]:px-8 [&>button]:py-3.5 [&>button]:text-base [&>button]:font-semibold [&>button]:bg-white [&>button]:dark:bg-slate-900 [&>button]:border [&>button]:border-slate-300 [&>button]:dark:border-slate-700 [&>button]:text-slate-900 [&>button]:dark:text-slate-100 [&>button]:rounded-xl [&>button]:transition-all [&>button]:hover:bg-slate-50 [&>button]:dark:hover:bg-slate-800">
                <ResumeDownloadButton />
              </div>
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-2">
            <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] italic">Resume not available yet.</p>
          </section>
        )}

        {resumeExperience && (
          <section className="flex flex-col gap-6 mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Experience</h2>
            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {resumeExperience}
            </div>
          </section>
        )}
      </main>
    </Container>
  );
}
