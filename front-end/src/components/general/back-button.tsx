import { ArrowLeftIcon } from "lucide-react";
import React from "react";

const BackButton:React.FC = () => {
    return( 
        <div className="flex flex-row gap-3 items-center cursor-pointer ">
            <ArrowLeftIcon className="w-6 h-6" strokeWidth={2.95}/>
            <p className="font-bold text-[1.1rem]">Back</p>
        </div>
    )
}

export default BackButton