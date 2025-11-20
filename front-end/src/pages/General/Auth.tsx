import React, { useState } from "react";
import InputText from "../../components/general/input";

const Auth:React.FC = () =>{
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    return(
        <div className="w-screen h-screen flex justify-center items-center bg-[#B09331]">
            <div className="flex flex-col bg-[#2D2322] w-[80%] items-center p-4 rounded-2xl h-fit">
                <img src="/image/logo.png" className="w-[7.5rem]"/>
                <InputText label={"Username"} placeholder={"Username"} value={username} setValue={setUsername}/>
                <InputText isPassword label={"Password"} placeholder={"Password"} value={password} setValue={setPassword}/>
                <div className="w-full justify-center flex">
                    <button className="bg-[#B39135] p-1 w-[50%] rounded-lg mt-4">Sign In</button>
                </div>
            </div>
        </div>
    )
}

export default Auth;