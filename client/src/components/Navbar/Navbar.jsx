import React, { useState } from 'react'
import ProfileInfo from '../Cards/ProfileInfo';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';

const Navbar = ({userInfo, onSearchNote, handleClearSearch}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  
  }

  const handleSearch = () => {
        if(searchQuery){
          onSearchNote(searchQuery)
        }
    
  }


  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setSearchQuery("");
      handleClearSearch();
    }
};
  return (
    <div className='bg-white py-2 px-2 drop-shadow-sm flex items-center justify-between'>
        <h2 className='text-xl font-medium text-black py-2'>Notes.</h2>
         <SearchBar
         value={searchQuery}
         onChange={({target}) => {
          setSearchQuery(target.value)
         }}
         handleSearch={handleSearch}
         onClearSearch={onClearSearch}
      
         />
        <ProfileInfo userInfo={userInfo} onLogout={onLogout}/>
    </div>
  )
}

export default Navbar