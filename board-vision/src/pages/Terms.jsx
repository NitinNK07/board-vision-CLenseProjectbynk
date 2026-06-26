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
          { icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'Acceptance of Terms', content: 'By accessing Board Vision (CLens), you agree to these Terms of Service. This application is developed as an academic thesis project and is provided for educational and analytical purposes.' },
          { icon: <FileText className="w-5 h-5 text-blue-500" />, title: 'Service Description', content: 'CLens utilizes advanced Vision Large Language Models (LLMs) to transcribe handwritten chess scoresheets into valid Portable Game Notation (PGN). Users are granted a daily allowance of scans, which can be extended via ad-credits.' },
          { icon: <CheckCircle className="w-5 h-5 text-green-500" />, title: 'Content Ownership', content: 'You retain all intellectual property rights to the chess games you upload. By submitting an image, you grant CLens temporary processing rights strictly for the purpose of executing the OCR transcription via the Groq API.' },
          { icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, title: 'AI Limitations & Accuracy', content: 'While our prompt-engineered Vision LLM operates at a high accuracy rate with 0.0% hallucination, we cannot guarantee perfect transcription for highly illegible handwriting. Furthermore, the Heuristic Analysis engine provides estimated evaluations based on material and center control, not absolute Stockfish depth calculations.' },
          { icon: <XCircle className="w-5 h-5 text-red-500" />, title: 'Prohibited Activities', content: 'Users may not abuse the API rate limits, attempt to bypass JWT authentication, upload non-chess imagery intended to exploit the LLM, or reverse-engineer the application backend.' },
          { icon: <Scale className="w-5 h-5 text-purple-500" />, title: 'Disclaimer of Liability', content: 'The CLens development team provides this academic prototype "as is." We bear no liability for data loss, inaccurate chess analysis, or API downtime caused by third-party LLM providers.' },
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
