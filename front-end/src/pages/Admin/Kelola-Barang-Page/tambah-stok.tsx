import React from "react";
import Header from "../../../components/general/header";
import BackButton from "../../../components/general/back-button";
import InputText from "../../../components/general/input";
import DropDown from "../../../components/general/dropdown";

const TambahStokPage:React.FC = () => {
    const barangOptions = ["Klepon", "Onde-onde", "Lemper", "Bolu Kukus"];
    return(
        <div className="flex flex-col">
            <header>
                <Header />
                    <main className="mt-[3.5rem] p-3 flex flex-col gap-3">
                        <BackButton />
                        <div className="flex w-full justify-center">
                            <div className="relative w-[14rem] h-[14rem] bg-[#1e1e1e] rounded-lg hover:border border-[#4f4f4f]">
                                <img src="/image/pfp.jpg" className="w-[14rem] h-[14rem] rounded-lg object-cover" />
                                <input type="file" className="absolute top-0 w-[14rem] h-[14rem] opacity-0" />
                            </div>
                        </div>
                        <DropDown label="Nama Barang" data={barangOptions} isImportant/>
                        <InputText label="Jumlah Stok" placeholder="Jumlah Stok" isImportant/>
                        <InputText label="Harga Stok" placeholder="Harga Stok" isImportant/>
                        <InputText label="Modal Stok" placeholder="Modal Stok" isImportant/>
                        <InputText label="Keterangan Stok" placeholder="Keterangan Stok" isTextarea rows={5}/>
                        <button className="bg-[#B39135] p-1 rounded-lg mt-4">
                            Tambah Stok
                        </button>
                    </main>
            </header>
        </div>
    )
}

export default TambahStokPage