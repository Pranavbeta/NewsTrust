import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ExternalLink,
  Shield,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/newstrust', color: 'hover:text-blue-600' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/newstrust', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/newstrust', color: 'hover:text-pink-600' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/newstrust', color: 'hover:text-blue-700' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/newstrust', color: 'hover:text-red-600' },
  ];

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Real-Time News', path: '/real-time' },
    { name: 'Submit News', path: '/submit' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
    { name: 'DMCA', path: '/dmca' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">NewsTrust</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
              Your trusted source for verified news and information. We're committed to fighting misinformation 
              and building a more informed society through community-driven verification.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 dark:text-gray-500 transition-colors duration-200 ${social.color}`}
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href="mailto:contact@newstrust.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  contact@newstrust.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href="tel:+1-555-123-4567"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  123 News Street<br />
                  Media City, MC 12345<br />
                  United States
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 text-sm">
              <span>© {currentYear} NewsTrust. All rights reserved.</span>
              <span>•</span>
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for truth</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Follow us:</span>
              <div className="flex space-x-2">
                {socialLinks.slice(0, 3).map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`transition-colors duration-200 ${social.color}`}
                      aria-label={social.name}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 