import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchResult from "./SearchResult";
import { PORT } from "../../config";

/**
 * Search is a component handling the search results page
 * 
 */
function Search() {
  const [searchResult, setResult] = useState();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q');
  const navigate = useNavigate()
  
  //Recieve search data from backend server.
  useEffect(() => {
        if(!query)
            navigate('/')
        axios.get(PORT+'/search?q='+query, {withCredentials: true})
          .then(response => {
            if(response.data.user)
              setResult(response.data.result);
            else{
              navigate('/login')
            }
          })
          .catch(error => {
              console.error('Error fetching data:', error);
          });
      }, []);
    function handleBackButton(event){
      event.preventDefault();
      navigate(`/`); 
    }
    /**
     * Send search result data to add to server's database. 
     * @param {*} res 
     */ 
    
  return searchResult ? (
    <div className="search_container">
      <button className="back_from_search" onClick={handleBackButton}>Back to calendar</button>
      <div className="search_results">
          {searchResult.map(val=>
              {
                const res = val.show; 
                return(
                  <SearchResult 
                  key={res.id}
                  id={res.id}
                  name={res.name}
                  premiered={res.premiered}
                  network={res.network?.name}
                  web={res.webChannel?.name}
                  imgSRC={res.image.medium}
                  />
          )
          }
          )}
          
      </div>
    </div>
      
  ):null;
}

export default Search;