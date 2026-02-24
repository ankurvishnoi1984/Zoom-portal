import React, { useState } from 'react'
import "./Head.css"
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { IoMdMenu } from "react-icons/io";
const Head = () => {
    
    const navigate = useNavigate()
    const [showItem, setShowItem] = useState(false)
    const [linknum, setLinkNum] = useState(1);
    const [isLogout, setIsLogout]= useState(false);
    const [showMenu, setShowMenu] = useState(true);
    
    const handelShowItem = ()=>{
        setShowItem(!showItem)
    }

    
  
    const handelSetActiveLink = (value)=>{
       if(value===1){
        setShowItem(false)
       } 
       setLinkNum(value)
    }

    const handelIsLogout = ()=>{
        setIsLogout(!isLogout)
    }

    const handelLogOut = ()=>{
       
        sessionStorage.clear();
        navigate('/')
      } 

     const handelShowMenu = ()=>{
        setShowMenu(!showMenu)
     }
  return (
    <div>
        <div className='navdiv'>
            <div className='leftnav'>
    <div className='menuicon' onClick={handelShowMenu}>
      <IoMdMenu size={26}/>
    </div>

  <div className="logo-pill">
  <img src="/images/Logo.png" alt="Logo" className="Logo"/>
</div>
  </div>
           <div className="profilediv" onClick={handelIsLogout}>
               <div>
               <img src="/images/avatar-4.jpg" className="pimage" alt="profile image" />
               </div>
               <span className="ml-2">User</span>
                                        <i className="ti-angle-down ml-2"></i>
                                        
            {isLogout && (
                <ul className="logoutdiv show-notification profile-notification">

                <li>
                    <div onClick={handelLogOut}>
                        <i className="ti-layout-sidebar-left"></i> Logout
                    </div>
                </li>
                </ul>
            )}
           </div>
        </div>
        <div className='flexdiv'>
            {showMenu && (<div className='sidebar'>
             <Link to="/dashboard" className="no-underline">
                <div className={` ${linknum===1 ?"side-but":"side-but1"} mt-3`}  onClick={()=>handelSetActiveLink(1)}>
                <span className="side-span"><i className="ti-home"></i></span>
                    Dashboard
                </div>
                </Link>
                <div className={` ${linknum===2 ?"side-but":"side-but1"}`}  onClick={()=>{handelSetActiveLink(2);handelShowItem()}}>
                <span className="side-span"><i className="ti-layout-grid2-alt"></i></span>
                    Add Meeting</div>
                {showItem && (
             <ul className="submenu">
  <Link to="/physicalMeeting" className="submenu-link">
    <li className="submenuitem">Physical</li>
  </Link>

  <Link to="/virtualMeeting" className="submenu-link">
    <li className="submenuitem">Virtual</li>
  </Link>
</ul>
                )}
            </div>)}
            <div className={`maindiv ${showMenu ? '' : 'maindiv1'}`}>
                <Outlet/>
            </div>
        </div>
    </div>
  )
}

export default Head