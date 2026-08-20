import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Certification from "@/models/Certification";
import { ExternalLink, Award } from "lucide-react";
import Image from "next/image";
import { ExpandableTags } from "./ExpandableTags";

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
          <h1 className="text-3xl font-extrabold text-black tracking-tight">Certifications</h1>
          <p className="text-black font-normal text-base leading-relaxed">
            Professional certifications and verified credentials.
          </p>
        </header>

        {certifications.length === 0 ? (
          <p className="text-slate-700 italic text-sm">No certifications yet.</p>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <div
                key={cert._id.toString()}
                className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-slate-300 "
              >
                {/* Badge */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1.5">
                  {cert.image ? (
                    <Image
                      src={cert.image}
                      alt={cert.issuer}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain drop-shadow-sm"
                    />
                  ) : (
                    <Award className="w-6 h-6 text-slate-600 " />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-black leading-tight">
                      {cert.title}
                    </h3>
                    {/* Link */}
                    {cert.url && (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-slate-600 hover:text-accent-blue transition-colors"
                        title="View credential"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-700 flex flex-col gap-0.5 mt-1">
                    <span className="font-medium text-slate-700 ">{cert.issuer}</span>
                    <span className="flex items-center gap-1.5">
                      {cert.date && (
                        <span>{formatDate(cert.date)}</span>
                      )}
                      {cert.date && cert.credentialId && <span className="w-1 h-1 rounded-full bg-slate-300 " />}
                      {cert.credentialId && (
                        <span className="font-mono truncate">ID: {cert.credentialId}</span>
                      )}
                    </span>
                  </p>
                  
                  <ExpandableTags skills={cert.skills} />
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </Container>
  );
}
