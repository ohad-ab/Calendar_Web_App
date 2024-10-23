import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PORT } from "../../config";

function Register(){
  const [username, setUsername] = useState('');
  const [password, setPaswword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e){
    e.preventDefault();
    if(password !== repeatPassword)
      alert("Please repeat the password correctly");
    else{
      axios.post(PORT+'/register', {username: username, password: password}, {withCredentials: true}).then((response)=>{
      if(response.data.success)
        navigate('/')
      else{
        alert(response.data.message)
      }
      }).catch((error)=>{
        alert(error);
      })
    }
  }

  return(
    <div className="register">
      <form onSubmit={handleSubmit} >
        <input name="username" placeholder="Email" onChange={(e)=>setUsername(e.target.value)} required/>
        <input name="password" placeholder="Password" type="password" onChange={(e)=>setPaswword(e.target.value)} required/>
        <input name="password" placeholder="Repeat Password" type="password" onChange={(e)=>setRepeatPassword(e.target.value)} required/>
        <button className='login_button' type='submit'>Register</button>
      </form>
    </div>
  )
}

export default Register;