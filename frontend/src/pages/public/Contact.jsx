import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

function Contact() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:support@bizflow.in?subject=${encodeURIComponent(form.subject || 'Contact Form')}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold text-blue-600">BizFlow</span>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Contact Us</h1>
            <p className="mt-4 text-lg text-gray-500">Have a question or need help? Reach out and we&apos;ll get back to you.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Email</h3>
                <a href="mailto:razatosif206@gmail.com" className="mt-1 block text-sm text-blue-600 hover:text-blue-700">razatosif206@gmail.com</a>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Phone</h3>
                <a href="tel:+917047389630" className="mt-1 block text-sm text-blue-600 hover:text-blue-700">+91 7047389630</a>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Hours</h3>
                <p className="mt-1 text-sm text-gray-500">Mon – Sat, 10 AM – 7 PM IST</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input id="name" type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="email" type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input id="subject" type="text" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="What is this about?" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" rows={4} required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" placeholder="Tell us how we can help" />
              </div>
              <button type="submit" className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">Send Message</button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold text-white">BizFlow</span>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="mailto:razatosif206@gmail.com" className="hover:text-white transition-colors">razatosif206@gmail.com</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center"><p className="text-sm">© 2026 BizFlow. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default Contact;
