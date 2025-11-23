import { PlusIcon } from "lucide-react";
import React from "react";

interface props{
    title?: string
}

const TitleAdd:React.FC<props> = ({title}) =>{
    return(
        <div className="flex flex-row justify-between items-center"><p className="font-semibold text-[1.25rem]">{title}</p> <button className="bg-[#B09331] rounded-lg p-1"><PlusIcon /></button></div>
    )
}

export default TitleAdd