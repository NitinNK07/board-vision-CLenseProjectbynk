import { Shield, Eye, Database, Lock, UserCheck, Bell } from 'lucide-react';

const Privacy = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="text-center mb-12">
        <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Last updated: April 2026</p>
      </div>

      <div className="card p-8 space-y-8">
        {[
          { icon: <Eye className="w-5 h-5" />, title: 'Information We Collect', content: 'When you register for CLens, we collect basic profile details (name, email) and securely hash your password. For our core feature, we temporarily receive the chess scoresheet images you upload for AI Vision scanning.' },
          { icon: <Database className="w-5 h-5" />, title: 'How We Process Data', content: 'Your scoresheet images are transmitted securely to the Groq Vision LLM API (Llama-3.2) for transcription into PGN format. These physical images are NOT permanently stored on our servers; they are processed in-memory and discarded. Only the resulting PGN text and heuristic analysis metrics are saved to your account.' },
          { icon: <Lock className="w-5 h-5" />, title: 'Data Security', content: 'We secure your session using enterprise-grade JWT (JSON Web Tokens) authentication and encrypt passwords with BCrypt. All API interactions with the database (PostgreSQL) and LLM providers are conducted over secure, encrypted channels.' },
          { icon: <UserCheck className="w-5 h-5" />, title: 'Your Rights', content: 'You have full control over your digitized games. You can delete individual games from your history, export your PGN data at any time, or request complete account deletion by contacting nitinkolhe2004@gmail.com.' },
          { icon: <Bell className="w-5 h-5" />, title: 'Updates', content: 'As the CLens project evolves (e.g., adding new Vision models), this policy may be updated. Significant changes regarding image handling or data privacy will be communicated via your registered email.' },
        ].map((s, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
              {s.icon}
            </div>
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

export default Privacy;
