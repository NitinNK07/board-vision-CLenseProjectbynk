import { FileText, CheckCircle, AlertTriangle, Scale, XCircle } from 'lucide-react';

const Terms = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-12">
        <Scale className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold mb-3">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400">Last updated: April 2026</p>
      </div>

      <div className="card p-8 space-y-8">
        {[
          { icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'Acceptance of Terms', content: 'By using Board Vision — CLens, you agree to these Terms of Service. If you do not agree, please do not use the application.' },
          { icon: <FileText className="w-5 h-5 text-blue-500" />, title: 'Use of Service', content: 'Board Vision provides AI-powered chess scoresheet scanning, game analysis, and tactics training. The service is provided for educational and personal use. You must be at least 13 years old to create an account.' },
          { icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'User Content', content: 'You retain ownership of all chess games and PGN data you upload. By uploading scoresheet images, you grant us temporary permission to process them through our AI scanning service. Images are not stored permanently.' },
          { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, title: 'Limitations', content: 'Our AI scanning and analysis features provide best-effort results. Move recognition accuracy depends on image quality and handwriting clarity. Analysis is based on pattern heuristics and may not match professional engine evaluations.' },
          { icon: <XCircle className="w-5 h-5 text-red-500" />, title: 'Prohibited Use', content: 'You may not use the service to: distribute malware, attempt to gain unauthorized access, use automated scraping tools, or violate any applicable laws. We reserve the right to terminate accounts that violate these terms.' },
          { icon: <Scale className="w-5 h-5 text-purple-500" />, title: 'Liability', content: 'Board Vision is provided "as is" without warranties. We are not liable for any losses arising from inaccurate scan results, analysis errors, or service interruptions. Use the service at your own discretion.' },
        ].map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
            <div>
              <h2 className="text-lg font-bold mb-2">{s.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{s.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Terms;
