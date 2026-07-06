import Link from 'next/link';
import { TrendingUp, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-gray-900 bg-opacity-30 relative overflow-hidden">
      {/* Decorative accent background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Predictor AI
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Empowering entrepreneurs with geospatial AI success intelligence to start retail stores, cafes, and services at high-performing locations.
            </p>
            <div className="flex space-x-4">
              {/* Twitter SVG */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              {/* LinkedIn SVG */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* GitHub SVG */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-2.5">
              <li><Link href="/#features" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">Features</Link></li>
              <li><Link href="/#demo" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">Interactive Demo</Link></li>
              <li><Link href="/#pricing" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">Pricing Plans</Link></li>
              <li><Link href="/dashboard" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">Dashboard Panel</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">Market Studies</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">Support Center</a></li>
              <li><Link href="/#faq" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase mb-4">Subscribe to Insights</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get monthly geospatial analysis trends and local event impacts in your inbox.
            </p>
            <form className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full bg-gray-950/60 border border-gray-800 rounded-lg py-2 pl-3 pr-8 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <Mail className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
              </div>
              <button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg px-3 py-2 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-900/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Business Success Predictor AI Inc. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
