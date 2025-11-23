import { FilterIcon, SearchIcon } from "lucide-react";
import React from "react";

interface props {
    placeholder?:string
}

const SearchBar:React.FC<props> = ({placeholder}) =>{
    return(
        <div className="bg-white w-full flex flex-row text-[#1e1e1e] h-[2.5rem] rounded-full items-center px-3 gap-2"> 
            <SearchIcon />
            <input type="text" className="h-full w-full bg-transparent outline-none" placeholder={placeholder}/>
            <FilterIcon />
        </div>
    )
}

export default SearchBar