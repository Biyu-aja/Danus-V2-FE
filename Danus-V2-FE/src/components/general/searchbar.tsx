import { FilterIcon, SearchIcon, X } from "lucide-react";
import React from "react";

interface props {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

const SearchBar: React.FC<props> = ({ placeholder, value, onChange }) => {
    return (
        <div className="bg-white w-full flex flex-row text-[#1e1e1e] h-[2.5rem] rounded-full items-center px-3 gap-2">
            <SearchIcon className="w-5 h-5 text-[#888]" />
            <input 
                type="text" 
                className="h-full w-full bg-transparent outline-none" 
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
            {value && (
                <button 
                    onClick={() => onChange?.("")}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <X className="w-4 h-4 text-[#888]" />
                </button>
            )}
            <FilterIcon className="w-5 h-5 text-[#888]" />
        </div>
    );
};

export default SearchBar;