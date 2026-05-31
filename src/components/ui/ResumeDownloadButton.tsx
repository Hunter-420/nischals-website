'use client';

import { Download } from 'lucide-react';

export default function ResumeDownloadButton() {
  return (
    <a
      href="/api/resume/download"
      download="resume.pdf"
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-black dark:hover:bg-white transition-colors"
    >
      <Download className="w-4 h-4" />
      Download PDF
    </a>
  );
}
