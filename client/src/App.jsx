import Register from "./RegisterAndLoginForm.jsx";
import axios from "axios";
import {UserContext, UserContextProvider} from "./UserContext.jsx";
import {useContext} from "react";
import Routes from "./Routes.jsx";

function App() {
  axios.defaults.baseURL="http://localhost:4040";
  axios.defaults.withCredentials = true;

  return (
      <UserContextProvider>
        <Routes/>
      </UserContextProvider>
  )
}

export default App
