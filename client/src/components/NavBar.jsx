import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';

function NavBar(){
  return (
    <nav>
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
        </ul>
    </nav>
  )
}

export default NavBar;

