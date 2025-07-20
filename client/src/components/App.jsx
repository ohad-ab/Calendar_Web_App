import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Calendar from '../pages/Calendar';
import Search from '../pages/Search';
import Show from '../pages/Show';
import Login from '../pages/Login';
import { PORT } from '../../config';
import Register from '../pages/Register';
import Logout from './Logout';

/**
 * 
 * The main component of the application that handles the routing
 */
function App() {
    const [name, setName] = useState();
    
    //Get user name from the server
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
    
    /**
     * Renders the app's header with title, search bar, and logout button.
     *
     * @param {{ user: string }} props - The logged-in user's name
     * @returns {JSX.Element|null}
     */
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
                <button className='search_button' type='submit'><span>search</span></button>
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
/**
 * Displays the home page with the user's calendar.
 * Redirects to login if user is not authenticated.
 *
 * @returns {JSX.Element|null}
 */
  function Home() {
    const [userData, setUserData] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
    axios.get(PORT, {withCredentials: true})
        .then(response => {
            if(response.data.user)
                {
                    setUserData((response.data));
                    
                }
            else{
                navigate('/login')
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
    }, []);

    return userData ? (
        <div>
            
            <Calendar shows={userData.shows}/>
        </div>
    ):null;
}

  


  return (
    <Router>
        <Header user={name}/>
            
        <div className='content'>
            <Routes>
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
