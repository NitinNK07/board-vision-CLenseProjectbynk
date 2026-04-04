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
          { icon: <Eye className="w-5 h-5" />, title: 'Information We Collect', content: 'We collect your name, email address, and password when you create an account. When you upload chess scoresheet images for scanning, the images are processed by our AI service and are not stored permanently.' },
          { icon: <Database className="w-5 h-5" />, title: 'How We Use Your Data', content: 'Your account information is used solely for authentication. Game data (PGN files, analysis results) is stored in our database to provide you with game history, statistics, and analysis features. We do not sell or share your personal data with third parties.' },
          { icon: <Lock className="w-5 h-5" />, title: 'Data Security', content: 'We use JWT-based authentication and bcrypt password hashing. All API communications use secure protocols. Your uploaded images are processed in memory and deleted after scanning.' },
          { icon: <UserCheck className="w-5 h-5" />, title: 'Your Rights', content: 'You can access, modify, or delete your account data at any time through your profile settings. You can export your games as PGN files. Contact us at nitinkolhe2004@gmail.com for data requests.' },
          { icon: <Bell className="w-5 h-5" />, title: 'Updates', content: 'We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or in-app notification.' },
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
