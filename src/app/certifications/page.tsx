import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Certification from "@/models/Certification";
import { ExternalLink, Award } from "lucide-react";
import Image from "next/image";

export const revalidate = 60;

async function getCertifications() {
  await connectToDatabase();
  const certs = await Certification.find().sort({ date: -1 }).lean();
  return certs as any[];
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Certifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Professional certifications and verified credentials.
          </p>
        </header>

        {certifications.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No certifications yet.</p>
        ) : (
          <section className="flex flex-col gap-0">
            {certifications.map((cert) => (
              <div
                key={cert._id.toString()}
                className="flex items-center gap-4 py-5 border-b border-gray-100 dark:border-gray-800 first:pt-0 last:border-0"
              >
                {/* Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {cert.image ? (
                    <Image
                      src={cert.image}
                      alt={cert.issuer}
                      width={40}
                      height={40}
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <Award className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {cert.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {cert.issuer}
                    {cert.date && (
                      <span className="text-gray-400 dark:text-gray-500"> · {formatDate(cert.date)}</span>
                    )}
                    {cert.credentialId && (
                      <span className="text-gray-400 dark:text-gray-500"> · ID: {cert.credentialId}</span>
                    )}
                  </p>
                  {cert.skills && cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {cert.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Link */}
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    title="View credential"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </Container>
  );
}
