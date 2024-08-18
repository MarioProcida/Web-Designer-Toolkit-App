import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <span className="text-white text-xl font-bold">Web Designer Toolkit</span>
          <button
            onClick={toggleMenu}
            className="md:hidden text-white focus:outline-none"
          >
            ☰
          </button>
        </div>
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block mt-4 md:mt-0`}>
          <div className="flex flex-col md:flex-row md:space-x-4">
            {[
              { path: '/', label: 'Dashboard' },
              { path: '/projects', label: 'Progetti' },
              { path: '/quotes', label: 'Preventivi' },
              { path: '/contracts', label: 'Contratti' },
              { path: '/code-editor', label: 'Editor di Codice' },
              { path: '/design-tools', label: 'Strumenti di Design' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} text-white font-bold py-2 px-4 rounded transition duration-300 mb-2 md:mb-0`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;