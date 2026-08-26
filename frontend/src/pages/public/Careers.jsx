import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

const JOBS = [
  { title: 'Full-Stack Engineer', location: 'Remote (India)', type: 'Full-time', desc: 'Build core platform features across our React and Node.js stack.' },
  { title: 'Product Designer', location: 'Remote (India)', type: 'Full-time', desc: 'Design intuitive interfaces for our inventory, POS, and reporting modules.' },
];

function Careers() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold text-blue-600">StoreX</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">{l.label}</Link>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
              <Link to="/register" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Start Free</Link>
            </div>
            <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer" aria-label="Toggle menu">
              {mobileOpen ? <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">{l.label}</Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Start Free</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Careers</h1>
            <p className="mt-4 text-lg text-gray-500">Join us and help build the future of business management for millions of Indian businesses.</p>
          </div>

          <div className="mt-16 space-y-4">
            {JOBS.map((job) => (
              <div key={job.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>{job.location}</span>
                      <span className="text-gray-300">|</span>
                      <span>{job.type}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{job.desc}</p>
                  </div>
                  <a href="mailto:careers@StoreX.in?subject=Application: {job.title}" className="shrink-0 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">Don&apos;t see a role that fits? <a href="mailto:careers@StoreX.in" className="font-medium text-blue-600 hover:text-blue-700">Send us your resume</a>.</p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold text-white">StoreX</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:support@StoreX.in" className="hover:text-white transition-colors">support@StoreX.in</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center"><p className="text-sm">© 2026 StoreX. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default Careers;
