import {useContext, useEffect, useState} from "react";
import Avatar from "./Avatar.jsx";
import Logo from "./Logo.jsx";
import {UserContext} from "./UserContext.jsx";

export default function Chat()
{
    const [ws,setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [selectedUserId,setSelectedUserId] = useState(null);
    const {username,id} = useContext(UserContext);

    useEffect(()=>{
        const ws = new WebSocket("ws://localhost:4040");
        setWs(ws);

        ws.addEventListener("message",handleMessage);
    },[]);

    function showOnlinePeople(peopleArray)
    {
        const people = {};

        peopleArray.forEach(({userId,username})=>{
            people[userId] = username;
        });

        setOnlinePeople(people);


    }
    function handleMessage(e){
        const messageData = JSON.parse(e.data);

        if("online" in messageData)
        {
            showOnlinePeople(messageData.online);
        }
    }

    const onlinePeopleIsOurUser = {...onlinePeople};

    delete  onlinePeopleIsOurUser[id];


    return(
        <div className='flex h-screen'>
            <div className="bg-white w-1/3">
                <Logo/>
                {Object.keys(onlinePeopleIsOurUser).map(userId=>(
                    <div onClick={()=>setSelectedUserId(userId)} key={userId} className={`border-b border-gray-100 py-2
                        flex items-center gap-2 cursor-pointer  ${selectedUserId == userId ? "bg-blue-100" : ""}`}>
                        {userId === selectedUserId && (
                            <div className={"w-1 bg-blue-500 h-12 rounded-r-md"}></div>
                        )}
                        <div className={"flex gap-2 py-2 pl-4 items-center"}>
                            <Avatar username={onlinePeople[userId]} userId={userId}/>
                            <span className={"text-gray-800"}>{onlinePeople[userId]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className='flex-grow'>
                    {!selectedUserId && (
                        <div className={"flex h-full flex-grow items-center justify-center"}>
                                <div className={"text-lg text-gray-500"}>&larr; Select a person</div>
                        </div>
                    )}
                </div>

                <div className='flex gap-2'>
                    <input type="text" placeholder="Type your message here"
                    className="bg-white border p-2 flex-grow
                    text-white rounded-sm"/>


                    <button className="bg-blue-500 text-white p-2 rounded-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                    </button>
                </div>
            </div>
        </div>
    )
}