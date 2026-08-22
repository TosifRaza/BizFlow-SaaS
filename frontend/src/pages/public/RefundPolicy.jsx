import { Link } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-8">&larr; Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900">Refund Policy</h1>
          <p className="mt-2 text-sm text-gray-400">Last updated: August 2026</p>

          <div className="mt-10 prose prose-sm prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Free Plan</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">The Free plan is free of charge and does not involve any billing or refunds.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Paid Plans</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">All paid plans include a 14-day free trial. You will not be charged during the trial period. If you cancel before the trial ends, no payment is processed. After the trial, refunds are handled on a case-by-case basis. Contact <a href="mailto:support@bizflow.in" className="text-blue-600 hover:text-blue-700">support@bizflow.in</a> within 7 days of a charge to request a refund.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-gray-900">How to Request a Refund</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">Email <a href="mailto:support@bizflow.in" className="text-blue-600 hover:text-blue-700">support@bizflow.in</a> with your registered email, plan details, and reason for the request. Refunds, if approved, are processed within 7–10 business days.</p>
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

export default RefundPolicy;
