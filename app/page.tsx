export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">CRM Speed</h1>
        <p className="text-gray-600 mb-8">Your lightning-fast CRM built in 23 minutes!</p>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Next Steps:</h2>
          <ol className="text-left text-sm space-y-2">
            <li>1. Create a Supabase project at supabase.com</li>
            <li>2. Run the SQL schema from supabase-schema.sql</li>
            <li>3. Update .env.local with your Supabase credentials</li>
            <li>4. Restart the dev server</li>
          </ol>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500">
              Built with Next.js 14, TypeScript, Tailwind CSS
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>✅ Authentication system ready</p>
          <p>✅ Contact management complete</p>
          <p>✅ Deal pipeline with Kanban</p>
          <p>✅ Dashboard with analytics</p>
        </div>
      </div>
    </div>
  )
}
