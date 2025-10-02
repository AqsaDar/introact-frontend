import React from "react";
import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-black shadow-2xl border-t border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Links */}
        {/* <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            <Link to="/dashboard" className="text-gray-700 hover:text-black transition-colors text-sm font-medium underline hover:no-underline cursor-pointer">
              Dashboard
            </Link>
            <Link to="/upload" className="text-gray-700 hover:text-black transition-colors text-sm font-medium underline hover:no-underline cursor-pointer">
              Upload
            </Link>
            <Link to="/reports" className="text-gray-700 hover:text-black transition-colors text-sm font-medium underline hover:no-underline cursor-pointer">
              Reports
            </Link>
            <Link to="/pipeline" className="text-gray-700 hover:text-black transition-colors text-sm font-medium underline hover:no-underline cursor-pointer">
              Pipeline
            </Link>
          </div>
        </div> */}

        {/* Bottom Bar */}
        <div className="border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-600 text-sm">
              © {currentYear} Lead Enrichment System. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;