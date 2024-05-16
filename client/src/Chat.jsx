import {useContext, useEffect, useRef, useState} from "react";
import Avatar from "./Avatar.jsx";
import Logo from "./Logo.jsx";
import {UserContext} from "./UserContext.jsx";
import {uniqBy} from "loadsh/array.js";

export default function Chat() {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const {username, id} = useContext(UserContext);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const divUnderMessages = useRef();


    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4040");
        setWs(ws);

        ws.addEventListener("message", handleMessage);
    }, []);

    function showOnlinePeople(peopleArray) {
        const people = {};

        peopleArray.forEach(({userId, username}) => {
            people[userId] = username;
        });

        setOnlinePeople(people);


    }

    function handleMessage(e) {
        const messageData = JSON.parse(e.data);

        if ("online" in messageData) {
            showOnlinePeople(messageData.online);
        } else if ("text" in messageData) {
            console.log(messageData);
            setMessages((prev) => ([...prev, {...messageData}]))
        }


    }

    const onlinePeopleIsOurUser = {...onlinePeople};

    delete onlinePeopleIsOurUser[id];


    function sendMessage(ev) {
        ev.preventDefault();
        console.log("Sending......");
        console.log(`Selected UserId:${selectedUserId}`);
        console.log(`New Message:${newMessageText}`);

        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));
        setNewMessageText("");

        setMessages(prev => ([...prev,
            {
                text: newMessageText,
                sender: id,
                recipient: selectedUserId,
                id: Date.now()
            }
        ]));

    }


    useEffect(()=>{
        const div = divUnderMessages.current;
        if(div)
        {
            div.scrollIntoView({behavior:"smooth"});
        }
    },[messages])


    const messagesWithoutDupes = uniqBy(messages, "id");
    return (
        <div className='flex h-screen'>
            <div className="bg-white w-1/3">
                <Logo/>
                {Object.keys(onlinePeopleIsOurUser).map(userId => (
                    <div onClick={() => setSelectedUserId(userId)} key={userId} className={`border-b border-gray-100 py-2
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
            <div className="flex flex-col bg-blue-200 w-2/3 p-2">
                <div className='flex-grow'>
                    {!selectedUserId && (
                        <div className={"flex h-full flex-grow items-center justify-center"}>
                            <div className={"text-lg text-gray-500"}>&larr; Select a person</div>
                        </div>
                    )}

                    {!!selectedUserId && (
                        <div className={"relative h-full"}>
                            <div className={"overflow-y-scroll absolute inset-0 top-0 left-0 right-0  bottom-2"}>
                                {messagesWithoutDupes.map(message => (
                                    <div key={message.id}
                                         className={(message.sender === id ? "text-right" : "text-left")}>
                                        <div
                                            className={"text-left text-sm inline-block p-2 my-2 rounded-sm " + (message.sender === id ? "bg-blue-500 text-white" : "bg-white")}
                                        >
                                            sender:{message.sender}<br/>
                                            my id :{id}<br/>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}

                                <div ref={divUnderMessages}>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!!selectedUserId && (
                    <form className='flex gap-2' onSubmit={sendMessage}>
                        <input type="text" value={newMessageText}
                               onChange={(ev) => setNewMessageText(ev.target.value)}
                               placeholder="Type your message here"
                               className="bg-white border outline-blue-400 p-2 flex-grow
                    text-dark rounded-sm"/>


                        <button type="submit" className="bg-blue-500 text-white p-2 rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"/>
                            </svg>

                        </button>
                    </form>

                )}
            </div>
        </div>
    )
}