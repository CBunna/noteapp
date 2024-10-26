import React, { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import PasswordInput from '../../components/Input/PasswordInput';
import { Link } from 'react-router-dom';
import { validationEmail } from '../../utils/help';

const SignUp = () => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();

    if(!name) {
      setError("Please Enter your name.")
      return;
    }
   
    if(!validationEmail(email)){
        setError("Please enter a valid email address.");
        return;
    }
    if(!password){
        setError("Please enter the password");
        return
    }
    setError("")
   
   }

  return (
    <div>
    <Navbar/>
    <div className='flex items-center justify-center mt-28'>
      <div className='w-96 border rounded big-white px-7 py-10'>
          <form onSubmit={handleSignup}>
              <h4 className='text-2xl mb-7'>Sign Up</h4>
              <input className='input-box' 
                    type="text" 
                    placeholder='Name' 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    />

              <input className='input-box' 
                    type="text" 
                    placeholder='Email' 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />

                <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}


                <button type='submit' className='btn-primary'>Sign Up</button>
                <p className="text-sm text-center mt-4">Already have account? {" "} 
                    <Link to="/login" className='font-medium text-primary underline'>Login</Link>
                </p>
              
          </form>
      </div>
    </div>
  </div>
  )
}

export default SignUp