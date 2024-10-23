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
    const [user, setUser] = useState()
  // const [count, setCount] = useState(0)

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )
    function Header(){
        const location = useLocation();

        return(
            <header>
                <h1 className='home_title'>Calendar</h1>
            <h2>Make your own series calendar</h2>
            {
             location.pathname !== '/login' || location.pathname !=='/register'?
            <div>
                {/* <p>hello {message.user.email}</p>  */}
                <Logout />
            </div>
             :''
            }
            </header>
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

    function handleSearch(event){
        event.preventDefault();
        console.log(searchData)
        navigate(`/search?q=${searchData.searchValue}`); 
    }

    function handleChange(event) {
        setSearchData({
            ...searchData,
            searchValue: event.target.value
        });
      }

    return message ? (
        <div>
            <form className='search' onSubmit={handleSearch}>
                <input className='search_value' name='search_value' placeholder='search series' onChange={handleChange}></input>
                <button className='search_button' type='submit'><span>serach</span></button>
            </form>
            <Calendar shows={message.shows}/>
        </div>
    ):null;
}

  


  return (
    <Router>
        <Header/>
            
        <div>
            <Routes>
                {/* <Route path="/about" element={<About />}/> */}
                <Route path="/" element={<Home/>} />
                <Route path="/search" element={<Search/>}/>
                <Route path="/show" element={<Show />}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/register' element={<Register/>}/>
            </Routes>
        </div>
    </Router>
);
}

export default App
