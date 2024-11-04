import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PORT } from "../../config";

function Login(){
  const [username, setUsername] = useState('');
  const [password, setPaswword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e){
    e.preventDefault();
   
      axios.post(PORT+'/login', {username: username, password: password}, {withCredentials: true}).then((response)=>{
      if(response.data.success)
        {
          console.log(response.data)
          navigate('/')
        }
      else{
        alert(response.data.message)
      }
      }).catch((error)=>{
        alert(error);
      })
    
  }
  return(
    <div className="login">
      <h1 className="home-title">Calendar</h1>
      <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Email" onChange={(e)=>setUsername(e.target.value)} required/>
      <input name="password" placeholder="Password" onChange={(e)=>setPaswword(e.target.value)} required/>
      <button className='login_button' type='submit'>Login</button>
      </form>
      <a href="/register">register</a>
    </div>
  )
}

export default Login;