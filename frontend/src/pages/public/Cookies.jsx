import { Link } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

function Cookies() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-8">&larr; Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: August 2026</p>

          <div className="mt-10 prose prose-sm prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">What Are Cookies</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your experience.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">How We Use Cookies</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">BizFlow uses essential cookies to authenticate your session and maintain your logged-in state. We do not use advertising or tracking cookies. No third-party cookies are set on our platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Managing Cookies</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">You can control or delete cookies through your browser settings. Disabling essential cookies may affect the functionality of BizFlow. For help, contact <a href="mailto:support@bizflow.in" className="text-blue-600 hover:text-blue-700">support@bizflow.in</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold text-white">BizFlow</span>
          </div>
          <p className="text-sm">© 2026 BizFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Cookies;
