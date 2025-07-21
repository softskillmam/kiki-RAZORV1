import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-kiki-purple-500 to-kiki-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h3 className="text-xl font-bold">KIKI's Learning Hub</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Empowering minds through innovative learning experiences. Join us in shaping the future of education with personalized, engaging programs for all ages.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/share/16cJ2N9GxA/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-kiki-blue-400 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/kikislearninghubklh?igsh=eTFldGVld2txMjV1" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-kiki-blue-400 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.linkedin.com/in/krithika-tamilselvan-997833125?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-kiki-blue-400 transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-kiki-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-kiki-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-300 hover:text-kiki-blue-400 transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/career-test" className="text-gray-300 hover:text-kiki-blue-400 transition-colors">
                  Career Test
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-kiki-blue-400" />
                <span className="text-gray-300 text-sm">kikislearninghubklh@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-kiki-blue-400" />
                <span className="text-gray-300 text-sm">+91 82208 79805</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-kiki-blue-400" />
                <span className="text-gray-300 text-sm mx-[21px]">A global hub for ideas and innovation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 KIKI's Learning Hub. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-gray-400 text-sm">for education</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;