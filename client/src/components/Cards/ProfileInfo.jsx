import React from 'react';
import { getInitials } from '../../utils/help';

const ProfileInfo = ({onLogout, userInfo}) => {

  const fullName =  userInfo?.fullName || "User";

  return (
    <div className='flex items-center gap-3'>
        <div className="w-12 h-12 flex items-center justify-center rounded-full text-slate-950 font-medium bg-slate-100">
        {getInitials(fullName)}
        </div>

        <div>
            <p className="text-sm font-medium">

             {fullName}
              
              </p>
            <button onClick={onLogout} className="text-sm text-slate-700 underline">Logout</button>
        </div>
    </div>
  )
}

export default ProfileInfo