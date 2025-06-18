import Link from "next/link"
import { Github, Twitter, MessageCircle, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black bg-opacity-80 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-primary mb-4">CNQR</h3>
            <p className="text-gray-400 mb-4 max-w-md">
              Powered by Lotus Dash. The ultimate gaming experience with premium credits, exclusive items, and unmatched
              support across all servers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a
                href="https://discord.gg/playcnqr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#5865F2] transition-colors"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/store" className="text-gray-400 hover:text-primary transition-colors">
                  Store
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-primary transition-colors">
                  Admin Panel
                </Link>
              </li>
              <li>
                <a
                  href="https://discord.gg/playcnqr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2"
                >
                  Discord Server
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-white mb-4">Available Now</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Credit Purchases</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Instant Delivery</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">Discord Integration</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-sm">WebApp Store (Soon)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 CNQR. All rights reserved. Powered by Lotus Dash.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
