import React from "react";
import Header from "../../components/general/header";
import Navbar from "../../components/admin/navbar";
import Total_Saldo from "../../components/admin/totalsaldo";
import CardItem from "../../components/admin/carditem";
import { PlusIcon } from "lucide-react";
import StokCard from "../../components/general/stokcard";

const Dashboard:React.FC = () =>{
    return(
        <div className="flex flex-col">
            <Header />
                <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[3rem]">
                    <Total_Saldo />
                    <section className="flex flex-row gap-2">
                        <CardItem label="Pemasukan" value="69.420"/>
                        <CardItem label="Pengeluaran" value="69.420"/>
                    </section>
                    <section className="flex flex-row gap-2">
                        <CardItem label="Jumlah Ambil" value="29"/>
                        <CardItem label="Jumlah Setor" value="19"/>
                    </section>
                    <section className="flex flex-col">
                        <div className="flex flex-row justify-between items-center"><p className="font-semibold text-[1.25rem]">Item Hari Ini</p> <button className="bg-[#B09331] rounded-lg p-1"><PlusIcon /></button></div>
                    </section>
                    <div className="flex flex-row flex-wrap justify-around gap-2">
                        <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                        <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                        <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                        <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                        <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                        <StokCard nama_item="Klepon" harga_item="12.000" jumlah_ambil={20} stok_tersisa={10} jumlah_setor={15}/>
                    </div>
                </main>
            <Navbar />
        </div>
    )
}

export default Dashboard