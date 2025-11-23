import React from "react";
import Header from "../../components/general/header";
import Total_Saldo from "../../components/admin/general-admin/totalsaldo";
import CardItem from "../../components/admin/general-admin/carditem";
import Navbar from "../../components/admin/general-admin/navbar";
import SearchBar from "../../components/general/searchbar";
import CardTransaksi from "../../components/admin/kelola-keuangan/cardtransaksi";

const KelolaKeuangan:React.FC = () => {
    return(
        <div className="flex flex-col">
            <Header />
                <main className="flex flex-col mt-[3.5rem] gap-3 p-3 mb-[3rem]">
                    <Total_Saldo />
                    <section className="flex flex-row gap-2">
                        <CardItem label="Pemasukan" value="69.420" />
                        <CardItem label="Pengeluaran" value="69.420"/>
                    </section>
                    <section className="bg-[#2e2e2e] p-3 rounded-xl flex flex-col gap-3">
                        <SearchBar placeholder="Cari Riwayat"/>
                            <div className="flex flex-col gap-2">
                                <CardTransaksi id={1} title="Makan" tipe="pemasukan" nominal="12.000" keterangan="lapar bos" created_at="12.00" />
                                <CardTransaksi id={1} title="Makan" id_setoran={2} tipe="pemasukan" nominal="12.000" created_at="12.00" />
                            </div>
                    </section>
                </main>
            <Navbar />
        </div>
    )
}

export default KelolaKeuangan