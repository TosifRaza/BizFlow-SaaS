import { Link } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-8">&larr; Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: August 2026</p>

          <div className="mt-10 prose prose-sm prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">By accessing or using StoreX, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">2. Description of Service</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">StoreX provides a cloud-based business management platform including inventory management, point-of-sale billing, customer and supplier management, reporting, and related features for Indian businesses.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">3. User Accounts</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information and are responsible for all activities under your account.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">4. Acceptable Use</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">You agree not to misuse the service, including but not limited to: attempting to gain unauthorized access, transmitting harmful content, or using the service for unlawful purposes.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">5. Limitation of Liability</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">StoreX is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">6. Contact</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">For questions about these terms, contact us at <a href="mailto:support@StoreX.in" className="text-blue-600 hover:text-blue-700">support@StoreX.in</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><HiOutlineCube className="w-5 h-5 text-white" /></div>
            <span className="text-xl font-bold text-white">StoreX</span>
          </div>
          <p className="text-sm">© 2026 StoreX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Terms;
