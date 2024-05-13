import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginorRegister,setIsLoginorRegister] = useState("register");
    const {setUsername:setLoggedInUsername,setId} = useContext(UserContext);
    async function handleSubmit(ev){
        ev.preventDefault();
        const url = isLoginorRegister === 'register' ? "register" : "login";
        const {data} =await axios.post(url,{username,password});
        setLoggedInUsername(username);
        setId(data.id);
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form className='w-64 mx-auto mb-12' onSubmit={handleSubmit}>
                <input type="text"
                       value={username}
                       onChange={(ev) => setUsername(ev.target.value)}
                       placeholder="username" className="block rounded-sm w-full p-2 mb-2 border-2"/>
                <input type="password"
                       value={password}
                       onChange={(ev) => setPassword(ev.target.value)}
                       placeholder="password" className="block rounded-sm w-full p-2 mb-2 border-2"/>
                <button className='bg-blue-500 text-white block w-full rounded-sm p-2'>
                    {isLoginorRegister === "register" ? "Register" : "Login"}
                </button>

                <div className="text-center font-semibold mt-2">
                    {isLoginorRegister === "register" && (
                        <span>Already a member ? <button onClick={()=>setIsLoginorRegister("login")}>Login Here</button></span>
                    )}

                    {isLoginorRegister === "login" && (
                        <span>Don't you have an account ? <button onClick={()=>setIsLoginorRegister("register")}>Register here</button></span>
                    )}

                </div>
            </form>
        </div>
    )
}