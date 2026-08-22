import { Link } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-8">&larr; Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: August 2026</p>

          <div className="mt-10 prose prose-sm prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">1. Information We Collect</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">We collect information you provide directly, such as your name, email address, phone number, and business details when you create an account. We also collect usage data automatically, including IP address, browser type, and interaction patterns within the platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">2. How We Use Your Information</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">We use your information to provide and improve BizFlow services, process transactions, send service-related notifications, and respond to support requests. We do not sell your personal data to third parties.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">3. Data Security</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">We implement industry-standard security measures including encryption in transit (TLS), encrypted storage, access controls, and regular security audits to protect your data.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">4. Data Retention</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time by contacting support.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">5. Your Rights</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">You have the right to access, correct, or delete your personal data. You may also export your data or object to certain processing activities. To exercise these rights, contact <a href="mailto:support@bizflow.in" className="text-blue-600 hover:text-blue-700">support@bizflow.in</a>.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">For privacy-related questions, contact us at <a href="mailto:support@bizflow.in" className="text-blue-600 hover:text-blue-700">support@bizflow.in</a>.</p>
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

export default Privacy;