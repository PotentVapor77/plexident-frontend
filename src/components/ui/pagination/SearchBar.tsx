// src/components/ui/pagination/SearchBar.tsx

import React from "react";
import { Search, X } from "lucide-react";
import type { SearchBarProps } from "./types";


/**
 * ============================================================================
 * SEARCHBAR
 * Barra de búsqueda reutilizable.
 * Se puede usar sola o junto a <Pagination />.
 *
 * Uso:
 *   <SearchBar
 *     value={searchTerm}
 *     onChange={handleSearchChange}
 *     placeholder="Buscar por nombre, CI..."
 *   />
 * ============================================================================
 */
const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "Buscar...",
    className = "",
}) => {
    return (
        <div className={`w-full relative ${className}`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    title="Limpiar búsqueda"
                    aria-label="Limpiar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default React.memo(SearchBar);