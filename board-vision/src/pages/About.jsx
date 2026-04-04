import { useState } from 'react';
import { Crown, Github, Linkedin, Mail, ExternalLink, Code2, Brain, Rocket, ChevronDown, ChevronUp } from 'lucide-react';

const TEAM = [
  {
    name: 'Nitin N. Kolhe',
    role: 'AI & Data Science Student | Java Fullstack Developer',
    email: 'nitinkolhe2004@gmail.com',
    phone: '+91 9834778695',
    linkedin: 'https://linkedin.com/in/nitinkolhe',
    github: 'https://github.com/nitinkolhe',
    portfolio: 'https://frontend-one-hazel-79.vercel.app',
    color: 'from-violet-500 to-purple-600',
    ringColor: 'ring-violet-400',
    education: [
      { inst: 'GSM College of Engineering, Pune', degree: 'B.E. AI & Data Science (SPPU)', grade: 'SGPA: 9.10', year: '2022–2026' },
      { inst: 'Shree Sai Science College, Latur', degree: 'HSC', grade: '80%', year: '2021–2022' },
      { inst: 'Atma Malik International School, A. Nagar', degree: 'SSC', grade: '94.40%', year: '2020' },
    ],
    experience: [
      {
        title: 'Software Developer Intern',
        company: 'NeuAI Labs (Remote)',
        period: 'Dec 2024 – Jan 2025',
        points: [
          'Developed backend modules using Java & Spring Boot',
          'Built REST APIs with secure role-based data access',
          'Worked with structured datasets and database operations',
        ],
      },
    ],
    skills: {
      'Programming': ['Java', 'Python', 'C++'],
      'Data Analysis': ['SQL (MySQL)', 'Excel', 'Power BI', 'Data Visualization'],
      'Development': ['HTML', 'CSS', 'JavaScript', 'ReactJS', 'Spring Boot', 'REST APIs'],
      'Tools': ['Git', 'GitHub', 'VS Code', 'IntelliJ', 'Postman'],
    },
    achievements: [
      '8th Rank — Competitive Programming Contest (GDG Campus Pune)',
      'HackerRank Gold Badge in Java (908 pts)',
      'REST API Certification (HackerRank)',
      'GitHub Professional Certificate — Microsoft',
    ],
    projects: [
      { name: 'Centralized Health Card (CHC)', desc: 'Healthcare system using Java & Spring Boot with role-based authentication' },
      { name: 'Sales Dashboard (Power BI)', desc: 'Interactive dashboard to analyze sales trends and KPIs' },
    ],
    bio: 'Detail-oriented AI & Data Science student with strong foundations in Java development and data analysis. Passionate about solving real-world problems through technology.',
  },
  {
    name: 'Abhishek V. Kenjale',
    role: 'AI & Data Science Student | Backend Developer',
    email: 'abhishekkenjale101@gmail.com',
    phone: '+91 7709718795',
    linkedin: 'https://linkedin.com/in/abhishek-kenjale',
    github: 'https://github.com/Abhikenjale',
    portfolio: null,
    color: 'from-cyan-500 to-blue-600',
    ringColor: 'ring-cyan-400',
    education: [
      { inst: 'Savitribai Phule Pune University', degree: 'B.E. AI & Data Science', grade: 'SGPA: 9.0', year: '2022–2026' },
    ],
    experience: [],
    skills: {
      'Technical': ['Java', 'Core Java', 'JavaSE', 'Maven', 'JDBC', 'Python', 'SQL', 'Spring Boot'],
      'AI/ML': ['Data Visualization', 'AI Automation', 'Machine Learning'],
      'Tools': ['STS', 'Eclipse', 'AWS', 'OpenCV', 'Jupyter Notebook', 'Power BI', 'Excel'],
    },
    achievements: [
      'AI & Machine Learning Internship Certificate',
      'Created Handwriting Recognition Bot',
    ],
    projects: [],
    bio: 'Engineering student at SPPU Pune with strong Java and backend skills. Aspiring Java developer with interests in AI and Machine Learning.',
  },
  {
    name: 'Mrunal Satpute',
    role: 'AI & Data Science Student | Developer',
    email: 'mrunalsatpute16@gmail.com',
    phone: '',
    linkedin: 'https://linkedin.com/in/mrunal-satpute',
    github: 'https://github.com/mrunalsatpute',
    portfolio: null,
    color: 'from-emerald-500 to-teal-600',
    ringColor: 'ring-emerald-400',
    education: [
      { inst: 'Savitribai Phule Pune University', degree: 'B.E. AI & Data Science', grade: '', year: '2022–2026' },
    ],
    experience: [],
    skills: {},
    achievements: [],
    projects: [],
    bio: 'AI & Data Science student contributing to the CLens platform. Passionate about building innovative tech solutions.',
  },
];

const TeamCard = ({ member, index }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="card overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        {/* Gradient header band */}
        <div className={`h-28 bg-gradient-to-r ${member.color} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute text-white/10 text-6xl font-bold select-none"
                style={{
                  left: `${i * 80 - 20}px`,
                  top: `${(i % 2) * 30 - 10}px`,
                  transform: `rotate(${-15 + i * 5}deg)`,
                }}>♟</div>
            ))}
          </div>
        </div>

        {/* Profile photo circle */}
        <div className="flex justify-center -mt-14 relative z-10">
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${member.color} ring-4 ${member.ringColor} ring-offset-2 ring-offset-white dark:ring-offset-gray-900 flex items-center justify-center shadow-xl overflow-hidden`}>
            {/* Placeholder — replace with <img src={member.photo} /> later */}
            <span className="text-white text-3xl font-bold select-none">{initials}</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center px-5 pt-4 pb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member.role}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">{member.bio}</p>
          {member.portfolio && (
            <a
              href={member.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline transition-colors"
            >
              🌐 Portfolio: {member.portfolio.replace('https://', '')}
            </a>
          )}
        </div>

        {/* Contact buttons */}
        <div className="flex justify-center gap-3 px-5 py-4">
          <a href={`mailto:${member.email}`} className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-all" title="Email">
            <Mail className="w-4 h-4" />
          </a>
          {member.github && (
            <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-white text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-gray-900 transition-all" title="GitHub">
              <Github className="w-4 h-4" />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-all" title="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.portfolio && (
            <a href={member.portfolio} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-all" title="Portfolio">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Expand button */}
        {(member.skills && Object.keys(member.skills).length > 0 || member.achievements.length > 0) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full py-2.5 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors flex items-center justify-center gap-1 border-t border-gray-100 dark:border-gray-800"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {expanded ? 'Show Less' : 'View Details'}
          </button>
        )}

        {/* Expandable Details */}
        {expanded && (
          <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 animate-fadeIn">
            {/* Education */}
            {member.education.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  🎓 Education
                </h4>
                {member.education.map((e, i) => (
                  <div key={i} className="mb-2 pl-3 border-l-2 border-purple-200 dark:border-purple-800">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{e.inst}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{e.degree} {e.grade && `| ${e.grade}`}</p>
                    <p className="text-xs text-gray-400">{e.year}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            {member.experience.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  💼 Experience
                </h4>
                {member.experience.map((exp, i) => (
                  <div key={i} className="pl-3 border-l-2 border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{exp.title}</p>
                    <p className="text-xs text-gray-500">{exp.company} • {exp.period}</p>
                    <ul className="mt-1 space-y-0.5">
                      {exp.points.map((p, j) => (
                        <li key={j} className="text-xs text-gray-500 dark:text-gray-400 flex gap-1">
                          <span>•</span><span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {member.skills && Object.keys(member.skills).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  🛠 Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(member.skills).flat().map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {member.achievements.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  🏆 Achievements
                </h4>
                <ul className="space-y-1">
                  {member.achievements.map((a, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex gap-1.5">
                      <span className="text-yellow-500">★</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Projects */}
            {member.projects.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  📂 Projects
                </h4>
                {member.projects.map((p, i) => (
                  <div key={i} className="mb-2 pl-3 border-l-2 border-green-200 dark:border-green-800">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-extrabold gradient-text">Board Vision — CLens</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-powered chess application that scans hand-written scoresheets,
            analyzes games, and helps you improve your chess skills.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: <Brain className="w-4 h-4" />, label: 'AI Vision Scan', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
              { icon: <Rocket className="w-4 h-4" />, label: 'Game Analysis', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
              { icon: <Code2 className="w-4 h-4" />, label: 'Tactics Training', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
            ].map((f, i) => (
              <span key={i} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${f.color}`}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Java', 'Spring Boot', 'React', 'PostgreSQL', 'Groq AI', 'Gemini API', 'chess.js', 'Vite', 'JWT Auth'].map((t, i) => (
              <span key={i} className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <h2 className="text-2xl font-bold text-center mb-2">Meet the Team</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          The builders behind Board Vision — CLens
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM.map((member, i) => (
            <TeamCard key={i} member={member} index={i} />
          ))}
        </div>
      </div>

      {/* Fade in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default About;
