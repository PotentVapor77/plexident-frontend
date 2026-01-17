import { useState, useRef, useEffect } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 px-3 py-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-brand-500 rounded-full">
          <span className="text-sm font-medium text-white">
            {user?.nombres?.charAt(0)}
            {user?.apellidos?.charAt(0)}
          </span>
        </div>
        <div className="hidden text-left lg:block">
          <span className="block text-sm font-medium text-gray-900 dark:text-white">
            {user?.nombres} {user?.apellidos}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 capitalize">
            {user?.rol}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.nombres} {user?.apellidos}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.correo}
            </p>
          </div>
          
          {/* <div className="py-1">
            <Link
              to="/perfil"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Mi Perfil
            </Link>
            <Link
              to="/configuracion"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Configuración
            </Link>
          </div> */}
          
          <div className="py-1 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;