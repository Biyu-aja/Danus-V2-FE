import { UserIcon } from "lucide-react";
import React from "react";

const Header:React.FC = () =>{
    return(
        <div className="fixed flex w-full bg-[#1C1C20] h-[3.5rem] z-[60] p-3 text-white font-bold flex-row justify-between items-center ">
            <p>DanusKu</p>
            <div className="bg-[#B09331] rounded-full p-1">
                <UserIcon className="w-5 h-5" />    
            </div>    
        </div>
    )
}
export default Header;