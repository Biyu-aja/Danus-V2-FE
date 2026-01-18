import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { LogIn, User, Lock, Eye, EyeOff } from "lucide-react";

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
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    
    // Gunakan custom hook untuk logic
    const { login, isLoading, error } = useAuth();

    // Load remembered username on mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleAuth = async () => {
        if (!username.trim() || !password.trim()) return;
        
        // Save or remove remembered username
        if (rememberMe) {
            localStorage.setItem('rememberedUsername', username);
        } else {
            localStorage.removeItem('rememberedUsername');
        }
        
        await login(username, password);
    };

    // Handle Enter key press
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleAuth();
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-[#B09331] via-[#8B7424] to-[#6B5A1C]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
            </div>

            {/* Login Card */}
            <div 
                className="relative flex flex-col bg-[#2D2322] w-[90%] max-w-[400px] items-center p-8 rounded-3xl shadow-2xl border border-[#3D3332]"
                onKeyDown={handleKeyDown}
            >
                {/* Logo & Title */}
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-gradient-to-br from-[#B09331] to-[#8B7424] p-3 rounded-2xl shadow-lg mb-4">
                        <img src="/image/logo.png" className="w-20 h-20 object-contain" alt="Logo" />
                    </div>
                    <h1 className="text-white text-2xl font-bold">Danus OSIS</h1>
                    <p className="text-gray-400 text-sm mt-1">Silahkan login untuk melanjutkan</p>
                </div>

                {/* Form */}
                <div className="w-full space-y-4">
                    {/* Username Input */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            className="w-full bg-[#3D3332] text-white pl-10 pr-4 py-3 rounded-xl border border-[#4D4342] focus:border-[#B09331] focus:ring-2 focus:ring-[#B09331]/20 outline-none transition-all placeholder:text-gray-500"
                            autoComplete="username"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                            <Lock size={18} />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-[#3D3332] text-white pl-10 pr-12 py-3 rounded-xl border border-[#4D4342] focus:border-[#B09331] focus:ring-2 focus:ring-[#B09331]/20 outline-none transition-all placeholder:text-gray-500"
                            autoComplete="current-password"
                        />
                        {/* Eye Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 accent-[#B09331] rounded cursor-pointer"
                        />
                        <label 
                            htmlFor="rememberMe" 
                            className="text-gray-400 text-sm cursor-pointer select-none hover:text-gray-300 transition-colors"
                        >
                            Ingat username saya
                        </label>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="w-full mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    className="w-full mt-6 bg-gradient-to-r from-[#B09331] to-[#8B7424] hover:from-[#C9A83A] hover:to-[#A08530] text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]" 
                    onClick={handleAuth}
                    disabled={isLoading || !username.trim() || !password.trim()}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Auth;