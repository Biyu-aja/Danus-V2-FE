import React from "react";

interface props {
    data?: any
}

const CardBarang:React.FC<props> = ({data}) => {
    const nama_item = "Klepon";
    const keterangan = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente consequuntur, vero temporibus accusamus iste, blanditiis reiciendis qui excepturi labore hic laborum? Repellat quo voluptas alias id asperiores accusamus tenetur ratione!"
    return(
        <div className="relative min-w-[10rem] max-w-[10rem] h-[10rem] rounded-xl hover:scale-[105%] cursor-pointer transition-all">
            <img src="/image/pfp.jpg" className="object-cover rounded-xl w-[10rem] h-[10rem]" />
            <div className="absolute bottom-0 w-full">
                <div className="bg-[#B09331]/85 w-full flex flex-col justify-between rounded-b-xl px-2 p-1 text-[0.65rem]">
                    <p className="font-extrabold text-[1rem]">{nama_item}</p>
                    <p className="line-clamp-2">{keterangan}</p>
                </div>
            </div>
        </div>
    )
}

export default CardBarang