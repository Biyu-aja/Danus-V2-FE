import React from "react";
import Header from "../../components/general/header";
import Navbar from "../../components/admin/navbar";
import Total_Saldo from "../../components/admin/totalsaldo";
import CardItem from "../../components/admin/carditem";

const Dashboard:React.FC = () =>{
    return(
        <div className="flex flex-col">
            <Header />
                <main className="flex flex-col mt-[3.5rem] p-3">
                    <Total_Saldo />
                    <section className="flex flex-row">
                        <CardItem label="Pemasukan" value="69.420"/>
                    </section>
                </main>
            <Navbar />
        </div>
    )
}

export default Dashboard