import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { PORT } from "../../config";

function Register(props){
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPaswword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
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
    if(password !== repeatPassword)
      alert("Please repeat the password correctly");
    else{
      axios.post(PORT+'/register', {username: username, password: password, repeatedPassword: repeatPassword ,name: name}, {withCredentials: true}).then((response)=>{
      if(response.data.success){
        props.onLogin(response.data.user.name);
        navigate('/')
      }
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
      <h1 className="home-title">Calendar</h1>
      <div className="register-form-container">
        <form className="register-form" onSubmit={handleSubmit} >
          <h2>Register</h2>
          <input className="register-input" name="username" placeholder="Email" onChange={(e)=>setUsername(e.target.value)} required/>
          <input className="register-input" name="name" placeholder="Name" onChange={(e)=>setName(e.target.value)} required/>
          <input className="register-input" name="password" placeholder="Password" type="password" onChange={(e)=>setPaswword(e.target.value)} required/>
          <input className="register-input" name="password" placeholder="Repeat Password" type="password" onChange={(e)=>setRepeatPassword(e.target.value)} required/>
          <button className='register-button' type='submit'>Register</button>
          <a href="/login">login</a>
        </form>
        </div>
    </div>
  )
}

export default Register;