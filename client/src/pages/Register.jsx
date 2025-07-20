import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { PORT } from "../../config";
/**
 * Register component for user sign-up and authentication.
 *
 * @param {{ onLogin: function }} props - Callback for updating parent on successful registration.
 * @returns {JSX.Element}
 */
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
      axios.post(PORT+'/register', {username, password, repeatedPassword: repeatPassword ,name}, {withCredentials: true}).then((response)=>{
      const { success, user, message } = response.data;
      if(success){
        props.onLogin(user.name);
        navigate('/')
      }
      else{
        alert(message)
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
          <input className="register-input" name="username" placeholder="Email" type="email" onChange={(e)=>setUsername(e.target.value)} required/>
          <input className="register-input" name="name" placeholder="Name" onChange={(e)=>setName(e.target.value)} required/>
          <input className="register-input" name="password" placeholder="Password" type="password" onChange={(e)=>setPaswword(e.target.value)} required/>
          <input className="register-input" name="password" placeholder="Repeat Password" type="password" onChange={(e)=>setRepeatPassword(e.target.value)} required/>
          <button className='register-button' type='submit'>Register</button>
          <Link to="/login">Login</Link>
        </form>
        </div>
    </div>
  )
}

export default Register;