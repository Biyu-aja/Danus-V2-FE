import React, { useState } from "react";
import InputText from "../../components/general/input";
import { useNavigate } from "react-router-dom";

const Auth:React.FC = () =>{
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()

    const handleAuth = async () => {
    // try {
    //     const res = await fetch("http://localhost:3000/api/Login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ username, password }),
    //     });

    //     const data = await res.json();

    //     if (!res.ok) {
    //     alert(data.message);
    //     return;
    //     }

    //     // save user
    //     localStorage.setItem("user", JSON.stringify(data.user));

    //     // 👇 ROLE-BASED NAVIGATION
    //     if (data.user.role === "admin") {
    //     navigate("/admin");
    //     } else {
    //     navigate("/user");
    //     }

    // } catch (err) {
    //     alert("Network error");
    //     console.error(err);
    // }
    navigate("/admin");
    };


    return(
        <div className="w-screen h-screen flex justify-center items-center bg-[#B09331]">
            <div className="flex flex-col bg-[#2D2322] w-[80%] items-center p-4 rounded-2xl h-fit">
                <img src="/image/logo.png" className="w-[7.5rem]"/>
                <InputText isWhite label={"Username"} placeholder={"Username"} value={username} setValue={setUsername}/>
                <InputText isWhite isPassword label={"Password"} placeholder={"Password"} value={password} setValue={setPassword}/>
                <div className="w-full justify-center flex">
                    <button className="bg-[#B39135] p-1 w-[50%] rounded-lg mt-4" onClick={handleAuth}>Sign In</button>
                </div>
            </div>
        </div>
    )
}

export default Auth;