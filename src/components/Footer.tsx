'use client';

import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub, FaRegEnvelope } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Networty
            </h3>
            <p className="text-gray-400">
              Empowering startups with the tools and connections they need to succeed.
            </p>
            <div className="flex space-x-4">
              <SocialIcon 
                href="https://twitter.com" 
                icon={<FaTwitter className="h-5 w-5" />} 
                label="Twitter" 
              />
              <SocialIcon 
                href="https://linkedin.com" 
                icon={<FaLinkedin className="h-5 w-5" />} 
                label="LinkedIn" 
              />
              <SocialIcon 
                href="https://github.com" 
                icon={<FaGithub className="h-5 w-5" />} 
                label="GitHub" 
              />
              <SocialIcon 
                href="mailto:contact@startuphub.com" 
                icon={<FaRegEnvelope className="h-5 w-5" />} 
                label="Email" 
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="/" text="Home" />
              <FooterLink href="/co-founder" text="Find Co-founder" />
              <FooterLink href="/startup-funding" text="Funding Options" />
              <FooterLink href="/blogs" text="Blog Articles" />
              <FooterLink href="/about" text="About Us" />
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Resources</h4>
            <ul className="space-y-2">
              <FooterLink href="/guides" text="Startup Guides" />
              <FooterLink href="/templates" text="Business Templates" />
              <FooterLink href="/tools" text="Free Tools" />
              <FooterLink href="/events" text="Upcoming Events" />
              <FooterLink href="/faq" text="FAQ" />
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Updated</h4>
            <p className="text-gray-400">
              Subscribe to our newsletter for the latest startup news and resources.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} StartupHub. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <FooterLink href="/privacy" text="Privacy Policy" small />
            <FooterLink href="/terms" text="Terms of Service" small />
            <FooterLink href="/cookies" text="Cookie Policy" small />
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinkProps {
  href: string;
  text: string;
  small?: boolean;
}

function FooterLink({ href, text, small = false }: FooterLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className={`${small ? 'text-sm' : ''} text-gray-400 hover:text-white transition-colors duration-200`}
      >
        {text}
      </Link>
    </li>
  );
}

interface SocialIconProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function SocialIcon({ href, icon, label }: SocialIconProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="text-gray-400 hover:text-white transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </Link>
  );
}