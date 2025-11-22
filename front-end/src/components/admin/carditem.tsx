import React from "react";

interface props {
    label?: string,
    value?: string
}

const CardItem:React.FC<props> = ({label, value}) =>{
    return(
        <div className="bg-[#2E2E2E] flex flex-col w-full p-3 text-[#B09331] rounded-xl cursor-pointer">
            <p className="font-bold">{label}</p>
            <p className="w-full text-center font-medium">{value}</p>
        </div>
    )
}

export default CardItem