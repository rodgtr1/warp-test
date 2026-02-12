import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookIt - Meeting Room Booking',
  description: 'Book meeting rooms for your team',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-blue-600">
                BookIt
              </a>
              <div className="flex gap-4">
                <a href="/" className="text-gray-600 hover:text-gray-900">
                  Rooms
                </a>
                <a href="/my-bookings" className="text-gray-600 hover:text-gray-900">
                  My Bookings
                </a>
                <a href="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
