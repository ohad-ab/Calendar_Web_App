import { useState, useEffect } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
// import '../App.css'
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import HomeButtons from './HomeButtons';
import Calendar from './Calendar';
import Search from './Search';
import Show from './Show';
import Login from './Login';
import { PORT } from '../../config';
import Register from './Register';
import Logout from './Logout';

function App() {
    const [name, setName] = useState();
    
    useEffect(() => {
        axios.get(PORT, {withCredentials: true})
            .then(response => {
                if(response.data.user)
                    {
                    setName(response.data.user.name)
                  }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        }, []);

    const handleLogin = (username) => {
        setName(username);
        };

    function Header(props){
        const location = useLocation();
        const [searchData, setSearchData] = useState();
        const navigate = useNavigate();
    function handleSearch(event){
        event.preventDefault();
        navigate(`/search?q=${searchData}`); 
    }
    function handleChange(event) {
        setSearchData(event.target.value);
      }

        return((location.pathname !== '/login' && location.pathname !=='/register' && props.user)?
            <header>
            
            <div className='titles_container'>
                <h1 className='home-title'>Calendar</h1>
            </div>
            <form className='search' onSubmit={handleSearch}>
                <input className='search_value' value={searchData} name='search_value' placeholder='search series' onChange={handleChange}></input>
                <button className='search_button' type='submit'><span>serach</span></button>
            </form>
            {
            <div className='logout-container'>
                <p>Hello {props.user}!</p>
                <Logout />
            </div>
            }
            </header>:''
        )
    }

  function Home() {
    const [isAuth, setAuth] = useState(true);
    const [message, setMessage] = useState('');
    const [searchData, setSearchData] = useState({});
    const navigate = useNavigate();
    useEffect(() => {
    axios.get(PORT, {withCredentials: true})
        .then(response => {
            if(response.data.user)
                {
                    setMessage((response.data));
                    
                }
            else{
                navigate('/login')
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }, []);

    return message ? (
        <div>
            
            <Calendar shows={message.shows}/>
        </div>
    ):null;
}

  


  return (
    <Router>
        <Header user={name}/>
            
        <div className='content'>
            <Routes>
                {/* <Route path="/about" element={<About />}/> */}
                <Route path="/" element={<Home/>} />
                <Route path="/search" element={<Search/>}/>
                <Route path="/show" element={<Show />}/>
                <Route path='/login' element={<Login onLogin={handleLogin}/>}/>
                <Route path='/register' element={<Register onLogin={handleLogin}/>}/>
            </Routes>
        </div>
    </Router>
);
}

export default App
