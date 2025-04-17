'use client'; // Mark this as a Client Component

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-white/95 backdrop-blur-sm py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Networty
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" text="Home" currentPath={pathname} />
            <NavLink href="/co-founder" text="Co-founder" currentPath={pathname} />
            <NavLink href="/startup-funding" text="Funding" currentPath={pathname} />
            <NavLink href="/blogs" text="Blogs" currentPath={pathname} />
            <NavLink href="/about" text="About" currentPath={pathname} />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
              <svg
                className={`h-6 w-6 transform transition duration-300 ${isOpen ? "rotate-90" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
          <MobileNavLink href="/" text="Home" currentPath={pathname} />
          <MobileNavLink href="/co-founder" text="Co-founder" currentPath={pathname} />
          <MobileNavLink href="/startup-funding" text="Startup Funding" currentPath={pathname} />
          <MobileNavLink href="/blogs" text="Blogs" currentPath={pathname} />
          <MobileNavLink href="/about" text="About" currentPath={pathname} />
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  text: string;
  currentPath: string;
}

function NavLink({ href, text, currentPath }: NavLinkProps) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "text-blue-600 border-b-2 border-blue-600"
          : "text-gray-700 hover:text-blue-600 hover:border-b-2 hover:border-blue-300"
      }`}
    >
      {text}
    </Link>
  );
}

function MobileNavLink({ href, text, currentPath }: NavLinkProps) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {text}
    </Link>
  );
}