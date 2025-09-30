import React from "react";
import { Link } from "react-router-dom";
import { Zap, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        

        {/* Bottom Bar */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-black-400 text-sm">
              © {currentYear} Lead Enrichment System. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-black-400 hover:text-black transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-black-400 hover:text-black transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-black-400 hover:text-white transition-colors text-sm">
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
