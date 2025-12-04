import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              PromptVault 2.0
            </h3>
            <p className="text-gray-600 text-sm">
              Your comprehensive library of 20,000+ AI prompts for every use case.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/browse" className="text-gray-600 hover:text-blue-600 text-sm">
                  Browse All
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-blue-600 text-sm">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/featured" className="text-gray-600 hover:text-blue-600 text-sm">
                  Featured
                </Link>
              </li>
              <li>
                <Link href="/recent" className="text-gray-600 hover:text-blue-600 text-sm">
                  Recent
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/how-to-use" className="text-gray-600 hover:text-blue-600 text-sm">
                  How to Use
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-blue-600 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Models */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">AI Models</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/ai/chatgpt" className="text-gray-600 hover:text-blue-600 text-sm">
                  ChatGPT
                </Link>
              </li>
              <li>
                <Link href="/ai/claude" className="text-gray-600 hover:text-blue-600 text-sm">
                  Claude
                </Link>
              </li>
              <li>
                <Link href="/ai/universal" className="text-gray-600 hover:text-blue-600 text-sm">
                  Universal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} PromptVault. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-500 hover:text-blue-600 text-sm">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-blue-600 text-sm">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
