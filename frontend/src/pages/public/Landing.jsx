import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineBuildingStorefront,
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlinePlay,
} from 'react-icons/hi2';
import { formatCurrency } from '../../utils/helpers';

/* ─────────────────────── data constants ─────────────────────── */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
];

const FEATURES = [
  {
    icon: HiOutlineCube,
    title: 'Inventory Management',
    desc: 'Track stock in real-time, get low stock alerts, and manage inventory across multiple branches from a single dashboard.',
  },
  {
    icon: HiOutlineShoppingCart,
    title: 'POS & Billing',
    desc: 'Lightning-fast point-of-sale, generate GST-compliant invoices instantly, and accept cash, UPI, card, or credit payments.',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Customer Credit Tracking',
    desc: 'Track udhaar and outstanding credit, send payment reminders via WhatsApp, and maintain a complete customer ledger.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Sales Analytics',
    desc: 'Detailed daily, weekly, and monthly reports with profit & loss analysis, product-wise sales, and actionable business insights.',
  },
  {
    icon: HiOutlineTruck,
    title: 'Supplier Management',
    desc: 'Manage your supplier database, track payables and purchase history, and automate purchase record keeping.',
  },
  {
    icon: HiOutlineBuildingStorefront,
    title: 'Multi-Branch Support',
    desc: 'Operate multiple branches seamlessly, transfer stock between locations, and view consolidated reports across all outlets.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Create Account',
    desc: 'Sign up in under 2 minutes. No credit card required.',
  },
  {
    num: '02',
    title: 'Add Products',
    desc: 'Add your products, set prices, and organize by categories.',
  },
  {
    num: '03',
    title: 'Start Selling',
    desc: 'Use the POS to create invoices, track payments, and grow.',
  },
];

const BUSINESS_TYPES = [
  { label: 'Grocery Store', emoji: '🛒' },
  { label: 'Mobile Shop', emoji: '📱' },
  { label: 'Electronics', emoji: '💻' },
  { label: 'Garment Store', emoji: '👔' },
  { label: 'Hardware Store', emoji: '🔧' },
  { label: 'Wholesaler', emoji: '📦' },
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

const FAQS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes! Every plan comes with a 14-day free trial with full access to all features. No credit card required to start.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We use enterprise-grade security with 256-bit data encryption, daily automated backups, and secure data centers. Your business data is always protected.',
  },
  {
    q: 'Do I need special hardware?',
    a: 'No. BizFlow works on any device with a web browser — laptop, tablet, or mobile phone. No additional hardware or software installation needed.',
  },
  {
    q: 'Can I manage multiple branches?',
    a: 'Yes! Multi-branch management is available on our Business and Pro plans. You can transfer stock between branches and view consolidated reports.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel anytime from your account settings — no questions asked, no hidden fees. Your data will be available for export for 30 days after cancellation.',
  },
];

const FAKE_LOGOS = ['FreshMart', 'QuickBill', 'StockPro', 'SalesHub', 'TradeEasy', 'BillKaro'];

/* ─────────────────────── component ─────────────────────── */

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFaq = (i) => setOpenFaq((prev) => (prev === i ? null : i));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-shadow duration-300 ${
          scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <HiOutlineCube className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600">BizFlow</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => scrollTo(l.href)}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Start Free
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-2">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {l.label}
              </button>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-white to-transparent" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-28 sm:pb-36">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Run Your Entire Business From One Simple Dashboard.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Manage your inventory, sales, customers, and suppliers — all from
              one powerful platform. Built for Indian businesses, by Indian
              builders.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-black/10"
              >
                Start Free Trial
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => scrollTo('#features')}
                className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <HiOutlinePlay className="w-5 h-5" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TRUSTED BY ════════════════ */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
            Trusted by 500+ businesses across India
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {FAKE_LOGOS.map((name) => (
              <span
                key={name}
                className="text-xl font-bold text-gray-300 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Everything You Need to Run Your Business
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Powerful tools designed for every aspect of your business operations.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No complicated setup. Be up and running in minutes.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 items-start">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center">
                {/* Arrow between steps (desktop) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%]">
                    <svg className="w-full text-blue-200" fill="none" viewBox="0 0 200 12">
                      <path d="M0 6h180m0 0l-8-5m8 5l-8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-600/30 z-10">
                  {step.num}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ BUSINESS TYPES ════════════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Built For Every Business Type
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Whether you run a kirana store or a wholesale operation — BizFlow adapts to you.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BUSINESS_TYPES.map((bt) => (
              <div
                key={bt.label}
                className="group flex flex-col items-center gap-3 bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-4xl">{bt.emoji}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {bt.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              No hidden fees. No surprises. Pick the plan that fits your business.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-600/10'
                    : 'bg-white border border-gray-200 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                    POPULAR
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price === 0 ? '₹0' : formatCurrency(plan.price).replace('.00', '')}
                  </span>
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
                <Link
                  to="/register"
                  className={`mt-8 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Everything you need to know about BizFlow.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="flex items-center justify-between w-full px-6 py-4 text-left cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-medium text-gray-900">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 shrink-0 ml-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Grow Your Business?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join 500+ businesses already using BizFlow to streamline their operations.
          </p>
          <Link
            to="/register"
            className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Free Trial
            <HiOutlineArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer id="about" className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <HiOutlineCube className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BizFlow</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed max-w-xs">
                The all-in-one business management platform for Indian businesses.
                Manage inventory, billing, customers, and more.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Product</h4>
              <ul className="mt-4 space-y-2.5">
                <li><Link to="/" className="text-sm hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-sm hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#" className="text-sm hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-sm hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2026 BizFlow. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm hover:text-white transition-colors">support@bizflow.in</a>
              <a href="#" className="text-sm hover:text-white transition-colors">+91 98765 43210</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
