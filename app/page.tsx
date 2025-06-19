import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">CRM Speed</h1>
        <p className="text-gray-600 mb-8">Your lightning-fast CRM built in 23 minutes!</p>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-xl font-semibold">Get Started</h2>
          
          <div className="space-y-4">
            <Link 
              href="/auth/signup"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Account
            </Link>
            
            <Link 
              href="/auth/login"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Built with Next.js 15, TypeScript, Tailwind CSS
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500 space-y-1">
          <p>✅ Authentication system ready</p>
          <p>✅ Contact management complete</p>
          <p>✅ Deal pipeline with Kanban</p>
          <p>✅ Dashboard with analytics</p>
        </div>
      </div>
    </div>
  )
}
