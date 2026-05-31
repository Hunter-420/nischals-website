import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import ResumeDownloadButton from "@/components/ui/ResumeDownloadButton";

export const revalidate = 60;

async function getResumeUrl() {
  await connectToDatabase();
  const settings = await SiteSettings.findOne().lean() as any;
  return settings?.resumeUrl || null;
}

export default async function ResumePage() {
  const resumeUrl = await getResumeUrl();

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
            {resumeUrl && (
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  View Online ↗
                </a>
                <ResumeDownloadButton />
              </div>
            )}
          </div>
        </header>

        {resumeUrl ? (
          <section className="flex flex-col gap-4">
            {/* PDF iframe viewer */}
            <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-900">
              <iframe
                src={`${resumeUrl}#toolbar=0`}
                className="w-full"
                style={{ height: '80vh', minHeight: '600px' }}
                title="Resume PDF Viewer"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              Having trouble viewing?{' '}
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                Open in a new tab
              </a>{' '}
              or{' '}
              <a href="/api/resume/download" className="underline hover:text-gray-600">
                download the PDF
              </a>.
            </p>
          </section>
        ) : (
          <section className="flex flex-col gap-2">
            <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] italic">Resume not available yet.</p>
          </section>
        )}
      </main>
    </Container>
  );
}
