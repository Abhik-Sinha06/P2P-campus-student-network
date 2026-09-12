import './globals.css';
import Navbar from '@/components/Navbar';
import DisclaimerBanner from '@/components/DisclaimerBanner';

export const metadata = {
  title: 'P2P Student Micro-Lending Network | BCSE301P',
  description: 'A trust-based non-monetary sharing economy platform for verified VIT students.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-slate-900 bg-slate-50 font-sans antialiased">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-slate-700">
              P2P Student Micro-Lending Network • Software Engineering Lab (BCSE301P)
            </p>
            <p>
              Non-monetary peer exchange network for verified <span className="font-medium text-sky-600">@vitstudent.ac.in</span> accounts.
              Encouraging collaborative learning and shared campus resources.
            </p>
            <p className="text-[11px] text-slate-400">
              Developed by Abhik Sinha (24BCE1315)
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
