import { UserIcon } from "lucide-react";
import React from "react";

const Header:React.FC = () =>{
    return(
        <div className="fixed flex w-full bg-[#1C1C20] h-[3.5rem] z-[60] p-3 text-white font-bold flex-row justify-between items-center ">
            <p>DanusKu</p>   
        </div>
    )
}
export default Header;