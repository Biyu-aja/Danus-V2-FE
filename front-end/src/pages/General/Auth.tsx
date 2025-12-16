import React, { useState } from "react";
import InputText from "../../components/general/input";
import { useAuth } from "../../hooks/useAuth";

/**
 * Auth Page
 * 
 * Struktur:
 * - Logic: useAuth hook (src/hooks/useAuth.ts)
 * - Service: authService (src/services/auth.service.ts)
 * - Types: auth.types.ts (src/types/auth.types.ts)
 * - Config: api.config.ts (src/config/api.config.ts)
 */
const Auth: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    // Gunakan custom hook untuk logic
    const { login, isLoading, error } = useAuth();

    const handleAuth = async () => {
        await login(username, password);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-[#B09331]">
            <div className="flex flex-col bg-[#2D2322] w-[80%] items-center p-4 rounded-2xl h-fit">
                <img src="/image/logo.png" className="w-[7.5rem]" />
                <InputText 
                    isWhite 
                    label={"Username"} 
                    placeholder={"Username"} 
                    value={username} 
                    setValue={setUsername}
                />
                <InputText 
                    isWhite 
                    isPassword 
                    label={"Password"} 
                    placeholder={"Password"} 
                    value={password} 
                    setValue={setPassword}
                />
                {/* Error message */}
                {error && (
                    <div className="text-red-400 text-sm mt-2 text-center">
                        {error}
                    </div>
                )}
                <div className="w-full justify-center flex">
                    <button 
                        className="bg-[#B39135] p-1 w-[50%] rounded-lg mt-4 disabled:opacity-50" 
                        onClick={handleAuth}
                        disabled={isLoading}
                    >
                        {isLoading ? "Loading..." : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;