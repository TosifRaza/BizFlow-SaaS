// // import { useState, useEffect } from 'react';
// // import { Link } from 'react-router-dom';
// // import { HiOutlineCube, HiOutlineCheckCircle } from 'react-icons/hi2';
// // import { formatCurrency } from '../../utils/helpers';

// // /* ──────────────────── data ──────────────────── */

// // const NAV_LINKS = [
// //   { label: 'Features', href: '/#features' },
// //   { label: 'Pricing', href: '/#pricing' },
// //   { label: 'About', href: '/#about' },
// // ];

// // const PLANS = [
// //   {
// //     name: 'Free',
// //     price: 0,
// //     popular: false,
// //     features: [
// //       'Up to 100 products',
// //       '1 user',
// //       'Basic inventory tracking',
// //       'Basic sales reports',
// //       'Email support',
// //     ],
// //   },
// //   {
// //     name: 'Starter',
// //     price: 299,
// //     popular: false,
// //     features: [
// //       'Up to 1,000 products',
// //       'Up to 3 users',
// //       'Invoice generation',
// //       'Sales & purchase reports',
// //       'Customer & supplier management',
// //       'Priority email support',
// //     ],
// //   },
// //   {
// //     name: 'Business',
// //     price: 599,
// //     popular: true,
// //     features: [
// //       'Unlimited products',
// //       'Up to 10 users',
// //       'Advanced reports & analytics',
// //       'Staff roles & permissions',
// //       'Profit & loss statements',
// //       'GST-compliant invoices',
// //       'Phone & chat support',
// //     ],
// //   },
// //   {
// //     name: 'Pro',
// //     price: 999,
// //     popular: false,
// //     features: [
// //       'Unlimited products',
// //       'Multiple branches',
// //       'Advanced analytics & dashboards',
// //       'Automation & reminders',
// //       'API access',
// //       'Dedicated account manager',
// //       'Custom branding',
// //       'Priority support',
// //     ],
// //   },
// // ];

// // /* ──────────────────── component ──────────────────── */

// // function Pricing() {
// //   const [scrolled, setScrolled] = useState(false);
// //   const [mobileOpen, setMobileOpen] = useState(false);

// //   useEffect(() => {
// //     const onScroll = () => setScrolled(window.scrollY > 20);
// //     window.addEventListener('scroll', onScroll, { passive: true });
// //     return () => window.removeEventListener('scroll', onScroll);
// //   }, []);

// //   return (
// //     <div className="min-h-screen flex flex-col bg-white">
// //       {/* ══════════ NAVBAR ══════════ */}
// //       <nav
// //         className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${
// //           scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : ''
// //         }`}
// //       >
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="flex items-center justify-between h-16">
// //             <Link to="/" className="flex items-center gap-2">
// //               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
// //                 <HiOutlineCube className="w-5 h-5 text-white" />
// //               </div>
// //               <span className="text-xl font-bold text-blue-600">StoreX</span>
// //             </Link>

// //             {/* Desktop links */}
// //             <div className="hidden md:flex items-center gap-8">
// //               {NAV_LINKS.map((l) => (
// //                 <Link
// //                   key={l.href}
// //                   to={l.href}
// //                   className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
// //                 >
// //                   {l.label}
// //                 </Link>
// //               ))}
// //             </div>

// //             {/* Desktop CTAs */}
// //             <div className="hidden md:flex items-center gap-3">
// //               <Link
// //                 to="/login"
// //                 className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
// //               >
// //                 Login
// //               </Link>
// //               <Link
// //                 to="/register"
// //                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
// //               >
// //                 Start Free
// //               </Link>
// //             </div>

// //             {/* Mobile hamburger */}
// //             <button
// //               onClick={() => setMobileOpen((v) => !v)}
// //               className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
// //               aria-label="Toggle menu"
// //             >
// //               {mobileOpen ? (
// //                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
// //                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
// //                 </svg>
// //               ) : (
// //                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
// //                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
// //                 </svg>
// //               )}
// //             </button>
// //           </div>
// //         </div>

// //         {/* Mobile menu */}
// //         {mobileOpen && (
// //           <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
// //             {NAV_LINKS.map((l) => (
// //               <Link
// //                 key={l.href}
// //                 to={l.href}
// //                 onClick={() => setMobileOpen(false)}
// //                 className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
// //               >
// //                 {l.label}
// //               </Link>
// //             ))}
// //             <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
// //               <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
// //                 Login
// //               </Link>
// //               <Link
// //                 to="/register"
// //                 onClick={() => setMobileOpen(false)}
// //                 className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
// //               >
// //                 Start Free
// //               </Link>
// //             </div>
// //           </div>
// //         )}
// //       </nav>

// //       {/* ══════════ MAIN ══════════ */}
// //       <main className="flex-1 pt-24 pb-20">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           {/* Header */}
// //           <div className="text-center max-w-2xl mx-auto">
// //             <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
// //               Simple, Transparent Pricing
// //             </h1>
// //             <p className="mt-4 text-lg text-gray-500">
// //               No hidden fees. No surprises. Pick the plan that fits your business.
// //               Every plan includes a 14-day free trial.
// //             </p>
// //           </div>

// //           {/* Cards */}
// //           <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
// //             {PLANS.map((plan) => (
// //               <div
// //                 key={plan.name}
// //                 className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
// //                   plan.popular
// //                     ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10'
// //                     : 'bg-white border border-gray-200 hover:shadow-lg'
// //                 }`}
// //               >
// //                 {plan.popular && (
// //                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
// //                     POPULAR
// //                   </span>
// //                 )}
// //                 <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
// //                 <div className="mt-3 flex items-baseline gap-1">
// //                   <span className="text-4xl font-extrabold text-gray-900">
// //                     {plan.price === 0
// //                       ? '₹0'
// //                       : formatCurrency(plan.price).replace('.00', '')}
// //                   </span>
// //                   <span className="text-sm text-gray-400">/mo</span>
// //                 </div>
// //                 <ul className="mt-6 space-y-3 flex-1">
// //                   {plan.features.map((feat) => (
// //                     <li
// //                       key={feat}
// //                       className="flex items-start gap-2 text-sm text-gray-600"
// //                     >
// //                       <HiOutlineCheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
// //                       {feat}
// //                     </li>
// //                   ))}
// //                 </ul>
// //                 <Link
// //                   to="/register"
// //                   className={`mt-8 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
// //                     plan.popular
// //                       ? 'bg-blue-600 text-white hover:bg-blue-700'
// //                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
// //                   }`}
// //                 >
// //                   {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
// //                 </Link>
// //               </div>
// //             ))}
// //           </div>

// //           {/* FAQ hint */}
// //           <div className="mt-16 text-center">
// //             <p className="text-sm text-gray-500">
// //               Have questions?{' '}
// //               <Link to="/#about" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
// //                 Check our FAQ
// //               </Link>{' '}
// //               or{' '}
// //               <a href="mailto:support@StoreX.in" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
// //                 contact support
// //               </a>
// //               .
// //             </p>
// //           </div>
// //         </div>
// //       </main>

// //       {/* ══════════ FOOTER ══════════ */}
// //       <footer className="bg-gray-900 text-gray-400">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
// //           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
// //             <div className="flex items-center gap-2">
// //               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
// //                 <HiOutlineCube className="w-5 h-5 text-white" />
// //               </div>
// //               <span className="text-xl font-bold text-white">StoreX</span>
// //             </div>
// //             <div className="flex items-center gap-8 text-sm">
// //               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
// //               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
// //               <a href="mailto:support@StoreX.in" className="hover:text-white transition-colors">support@StoreX.in</a>
// //             </div>
// //           </div>
// //           <div className="mt-8 pt-6 border-t border-gray-800 text-center">
// //             <p className="text-sm">&copy; 2026 StoreX. All rights reserved.</p>
// //           </div>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // }

// // export default Pricing;
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { HiOutlineCube, HiOutlineCheckCircle } from 'react-icons/hi2';
// import { formatCurrency } from '../../utils/helpers';

// /* ──────────────────── data ──────────────────── */

// const NAV_LINKS = [
//   { label: 'Features', href: '/#features' },
//   { label: 'Pricing', href: '/#pricing' },
//   { label: 'About', href: '/#about' },
// ];

// const PLANS = [
//   {
//     name: 'Free',
//     price: 0,
//     popular: false,
//     features: [
//       'Up to 100 products',
//       '1 user',
//       'Basic inventory tracking',
//       'Basic sales reports',
//       'Email support',
//     ],
//   },
//   {
//     name: 'Starter',
//     price: 299,
//     popular: false,
//     features: [
//       'Up to 1,000 products',
//       'Up to 3 users',
//       'Invoice generation',
//       'Sales & purchase reports',
//       'Customer & supplier management',
//       'Priority email support',
//     ],
//   },
//   {
//     name: 'Business',
//     price: 599,
//     popular: true,
//     features: [
//       'Unlimited products',
//       'Up to 10 users',
//       'Advanced reports & analytics',
//       'Staff roles & permissions',
//       'Profit & loss statements',
//       'GST-compliant invoices',
//       'Phone & chat support',
//     ],
//   },
//   {
//     name: 'Pro',
//     price: 999,
//     popular: false,
//     features: [
//       'Unlimited products',
//       'Multiple branches',
//       'Advanced analytics & dashboards',
//       'Automation & reminders',
//       'API access',
//       'Dedicated account manager',
//       'Custom branding',
//       'Priority support',
//     ],
//   },
// ];

// /* ──────────────────── component ──────────────────── */

// function Pricing() {
//   const [scrolled, setScrolled] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener('scroll', onScroll, { passive: true });
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col bg-white">
//       {/* ══════════ NAVBAR ══════════ */}
//       <nav
//         className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 bg-white ${
//           scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : ''
//         }`}
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <Link to="/" className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
//                 <HiOutlineCube className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-bold text-blue-600">StoreX</span>
//             </Link>

//             {/* Desktop links */}
//             <div className="hidden md:flex items-center gap-8">
//               {NAV_LINKS.map((l) => (
//                 <Link
//                   key={l.href}
//                   to={l.href}
//                   className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
//                 >
//                   {l.label}
//                 </Link>
//               ))}
//             </div>

//             {/* Desktop CTAs */}
//             <div className="hidden md:flex items-center gap-3">
//               <Link
//                 to="/login"
//                 className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
//               >
//                 Start Free
//               </Link>
//             </div>

//             {/* Mobile hamburger */}
//             <button
//               onClick={() => setMobileOpen((v) => !v)}
//               className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
//               aria-label="Toggle menu"
//             >
//               {mobileOpen ? (
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
//                 </svg>
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Mobile menu */}
//         {mobileOpen && (
//           <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
//             {NAV_LINKS.map((l) => (
//               <Link
//                 key={l.href}
//                 to={l.href}
//                 onClick={() => setMobileOpen(false)}
//                 className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
//               >
//                 {l.label}
//               </Link>
//             ))}
//             <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
//               <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 onClick={() => setMobileOpen(false)}
//                 className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//               >
//                 Start Free
//               </Link>
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* ══════════ MAIN ══════════ */}
//       <main className="flex-1 pt-24 pb-20">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Header */}
//           <div className="text-center max-w-2xl mx-auto">
//             <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
//               Simple, Transparent Pricing
//             </h1>
//             <p className="mt-4 text-lg text-gray-500">
//               No hidden fees. No surprises. Pick the plan that fits your business.
//               Every plan includes a 14-day free trial.
//             </p>
//           </div>

//           {/* Cards */}
//           <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {PLANS.map((plan) => (
//               <div
//                 key={plan.name}
//                 className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
//                   plan.popular
//                     ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10'
//                     : 'bg-white border border-gray-200 hover:shadow-lg'
//                 }`}
//               >
//                 {plan.popular && (
//                   <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
//                     POPULAR
//                   </span>
//                 )}
//                 <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
//                 <div className="mt-3 flex items-baseline gap-1">
//                   <span className="text-4xl font-extrabold text-gray-900">
//                     {plan.price === 0
//                       ? '₹0'
//                       : formatCurrency(plan.price).replace('.00', '')}
//                   </span>
//                   <span className="text-sm text-gray-400">/mo</span>
//                 </div>
//                 <ul className="mt-6 space-y-3 flex-1">
//                   {plan.features.map((feat) => (
//                     <li
//                       key={feat}
//                       className="flex items-start gap-2 text-sm text-gray-600"
//                     >
//                       <HiOutlineCheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
//                       {feat}
//                     </li>
//                   ))}
//                 </ul>
//                 <Link
//                   to="/register"
//                   className={`mt-8 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
//                     plan.popular
//                       ? 'bg-blue-600 text-white hover:bg-blue-700'
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
//                 </Link>
//               </div>
//             ))}
//           </div>

//           {/* FAQ hint */}
//           <div className="mt-16 text-center">
//             <p className="text-sm text-gray-500">
//               Have questions?{' '}
//               <Link to="/#about" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
//                 Check our FAQ
//               </Link>{' '}
//               or{' '}
//               <a href="mailto:support@StoreX.in" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
//                 contact support
//               </a>
//               .
//             </p>
//           </div>
//         </div>
//       </main>

//       {/* ══════════ FOOTER ══════════ */}
//       <footer className="bg-gray-900 text-gray-400">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
//                 <HiOutlineCube className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-bold text-white">StoreX</span>
//             </div>
//             <div className="flex items-center gap-8 text-sm">
//               <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
//               <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
//               <a href="mailto:support@StoreX.in" className="hover:text-white transition-colors">support@StoreX.in</a>
//             </div>
//           </div>
//           <div className="mt-8 pt-6 border-t border-gray-800 text-center">
//             <p className="text-sm">&copy; 2026 StoreX. All rights reserved.</p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// export default Pricing;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineCheckCircle } from 'react-icons/hi2';
import { formatCurrency } from '../../utils/helpers';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'About', href: '/#about' },
];

const PLANS = [
  {
    name: 'Free',
    price: 0,
    popular: false,
    features: [
      'Up to 100 products',
      '1 user',
      'Basic inventory tracking',
      'Basic sales reports',
      'Email support',
    ],
  },
  {
    name: 'Starter',
    price: 299,
    popular: false,
    features: [
      'Up to 1,000 products',
      'Up to 3 users',
      'Invoice generation',
      'Sales & purchase reports',
      'Customer & supplier management',
      'Priority email support',
    ],
  },
  {
    name: 'Business',
    price: 599,
    popular: true,
    features: [
      'Unlimited products',
      'Up to 10 users',
      'Advanced reports & analytics',
      'Staff roles & permissions',
      'Profit & loss statements',
      'GST-compliant invoices',
      'Phone & chat support',
    ],
  },
  {
    name: 'Pro',
    price: 999,
    popular: false,
    features: [
      'Unlimited products',
      'Multiple branches',
      'Advanced analytics & dashboards',
      'Automation & reminders',
      'API access',
      'Dedicated account manager',
      'Custom branding',
      'Priority support',
    ],
  },
];

function Pricing() {
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
              <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">{l.label}</Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Start Free</Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Simple, Transparent Pricing</h1>
            <p className="mt-4 text-lg text-gray-500">No hidden fees. No surprises. Pick the plan that fits your business. Every plan includes a 14-day free trial.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10' : 'bg-white border border-gray-200 hover:shadow-lg'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">POPULAR</span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price === 0 ? '₹0' : formatCurrency(plan.price).replace('.00', '')}</span>
                  <span className="text-sm text-gray-400">/mo</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-gray-600">
                      <HiOutlineCheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-8 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">Have questions? <Link to="/#about" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Check our FAQ</Link> or <a href="mailto:support@StoreX.in" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">contact support</a>.</p>
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
          <div className="mt-8 pt-6 border-t border-gray-800 text-center"><p className="text-sm">&copy; 2026 StoreX. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default Pricing;