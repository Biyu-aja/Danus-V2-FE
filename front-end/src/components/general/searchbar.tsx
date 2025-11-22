import { FilterIcon, SearchIcon } from "lucide-react";
import React from "react";

const SearchBar:React.FC = () =>{
    return(
        <div className="bg-white w-full flex flex-row text-[#1e1e1e] h-[2.5rem] rounded-full items-center px-3 gap-2"> 
            <SearchIcon />
            <input type="text" className="h-full w-full bg-transparent outline-none" />
            <FilterIcon />
        </div>
    )
}

export default SearchBar