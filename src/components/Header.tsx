import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">Wonder of Recall</span>
                <div className="text-xs text-red-100">U.S. Product Safety Alerts</div>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-white hover:text-red-100 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-red-100 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200">
              About
            </Link>
            <Link href="/sources" className="text-white hover:text-red-100 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200">
              Sources
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-red-100">
              <div className="flex items-center space-x-2">
                <span>Last updated: <span id="last-updated" className="font-semibold">Loading...</span></span>
                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                  ⚡ Auto-updates daily
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 