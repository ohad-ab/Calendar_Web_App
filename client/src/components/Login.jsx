import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PORT } from "../../config";

function Login(props){
  const [username, setUsername] = useState('');
  const [password, setPaswword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(PORT, {withCredentials: true})
        .then(response => {
            if(response.data.user)
                {
                navigate('/')
              }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }, []);

  function handleSubmit(e){
    e.preventDefault();
   
      axios.post(PORT+'/login', {username: username, password: password}, {withCredentials: true}).then((response)=>{
      if(response.data.success)
        {
          props.onLogin(response.data.user.name)
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
      <form className="login-form" onSubmit={handleSubmit}>
      <input value={username} name="username" placeholder="Email" onChange={(e)=>setUsername(e.target.value)} required/>
      <input value={password} name="password" placeholder="Password" onChange={(e)=>setPaswword(e.target.value)} required/>
      <button className='login-button' type='submit'>Login</button>
      </form>
      <a href="/register">register</a>
    </div>
  )
}

export default Login;