import './globals.css';

export const metadata = {
  title: 'Weather Comparison App',
  description: 'Compare weather forecasts across multiple locations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white-800 mb-2">
              Weather Comparison
            </h1>
            <p className="text-white-600">
              Compare weather forecasts across locations
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}