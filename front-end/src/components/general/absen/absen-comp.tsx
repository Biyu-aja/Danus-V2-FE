import React, { useState } from "react";
import DropDown from "../dropdown";

interface props{
    id?: number
}

const absenComp:React.FC<props> = ({id}) => {
    const menu = ([
        {id: 1, nama: "Onde-onde", harga: 1000},
        {id: 2, nama: "Kue Lapis", harga: 2000},
        {id: 3, nama: "Kue Cubit", harga: 3000},
        {id: 4, nama: "Kue Putu", harga: 4000},
        {id: 5, nama: "Kue Apem", harga: 5000},
    ])
    const [jumlah, setJumlah] = useState(1);
    const [selectedMenu, setSelectedMenu] = useState(menu[0].id);
    const selectedItem = menu.find(item => item.id === selectedMenu);
    const totalPay = selectedItem ? selectedItem.harga * jumlah : 0;    

    return(
        <div className="bg-[#2e2e2e] flex flex-row p-3 rounded-xl">
            <img src="/image/onde.png" className="w-[5rem] h-[5rem] rounded-md object-cover" />
            <div className="flex flex-col ml-3 text-[0.9rem] justify-around">
                <span className="flex flex-row gap-1 items-center "><p className="font-bold">Barang: </p>
                    <select className="w-full" onChange={(e) => setSelectedMenu(Number(e.target.value))} value={selectedMenu}>
                        {menu.map((item, index)=>(
                            <option key={index} value={item.id}>{item.nama}</option>
                        ))}
                    </select>
                </span>
                <span className="flex flex-row gap-1 items-center">
                    <p className="font-bold">Jumlah:</p>
                    <input type="number" className="outline-none h-fit w-full" onChange={(e) => setJumlah(Number(e.target.value))} min={1} value={jumlah} />
                </span>
                <span className="font-bold flex flex-row gap-1">Rp.<p className="text-[#B09331]">{totalPay}</p></span>
            </div>
        </div>
    )
}

export default absenComp