import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/images/logo.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tasket",
  description: "Your personal basket of tasks — organized, focused, and smart.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 antialiased">
        {/* Navbar */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={logo}
                alt="Tasket logo"
                width={40}
                height={40}
                priority
                className="rounded-md"
              />
            </Link>
            {/* Nav Links */}
            {/* <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/tasks"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Tasks
              </Link>
              <Link
                href="/techniques"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Techniques
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                About
              </Link>
            </nav> */}

          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto">{children}</main>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-4 border-t mt-10">
          © {new Date().getFullYear()} Tasket — Built with ❤️
        </footer>
      </body>
    </html>
  );
}
