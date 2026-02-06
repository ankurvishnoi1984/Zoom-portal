import React, { useContext, useReducer, useState } from 'react';

// import '../../../assets/css/style.css'
// import '../../../assets/css/bootstrap/css/bootstrap.min.css'
import axios from 'axios';
import { API_URL } from '../../utils/constant';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { LoginContext } from '../../context/LoginContext';

const Login = () => {
  const [username, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate()

  const {handelSetUserId} = useContext(LoginContext)

  const handleLogin = async() => {
    // Handle login logic here
    if(!username || !password){
      toast.error("Please Provide Username or Password");
      return;
    }
       
    try {
       const res = await axios.post(`${API_URL}/auth/login`,{username,password});
        
       if(res?.data?.errorCode == "1"){
        
        console.log("inside handelLogin",res)
       
        sessionStorage.setItem('IsAdminLoggedIn',true)
        sessionStorage.setItem('userId',res?.data?.responseData?.userId)
        sessionStorage.setItem('roleId',res?.data?.responseData?.roleCode)

         navigate('/dashboard')
         //toast.success("Login Successful")
       }else{
        console.log("dfsdfsdfsdf",res?.data?.errorDetail)
        toast.error(`${res?.data?.errorDetail}`)
       }
    } catch (error) {
      console.error(error)
      toast.error(error?.response?.data?.errorDetail)
    }

    //console.log('Logging in with:', userId, password);
  };

  return (
    <div className="fix-menu">
      {/* Pre-loader start */}
      {/* <div className="theme-loader">
        <div className="loader-track">
          <div className="loader-bar"></div>
        </div>
      </div> */}
      {/* Pre-loader end */}

      <section className="login p-fixed d-flex text-center bg-primary common-img-bg">
        {/* Container-fluid starts */}
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              {/* Authentication card start */}
              <div className="login-card card-block auth-body mr-auto ml-auto">
                <form className="md-float-material">
                  <div className="text-center">
                  <img src="/images/Logo.png" alt="Logo" style={{width:"60%"}}/>
                  </div>
                  <div className="auth-box">
                    <hr />
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="User ID"
                        value={username}
                        onChange={(e) => setUserId(e.target.value)}
                      />
                      <span className="md-line"></span>
                    </div>
                    <div className="input-group">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <span className="md-line"></span>
                    </div>
                    <div className="row m-t-30">
                      <div className="col-md-12">
                        <button
                          type="button"
                          className="btn btn-primary btn-md btn-block waves-effect text-center m-b-20"
                          onClick={handleLogin}
                        >
                          Log in
                        </button>
                      </div>
                    </div>
                    <hr />
                  </div>
                </form>
                {/* end of form */}
              </div>
              {/* Authentication card end */}
            </div>
            {/* end of col-sm-12 */}
          </div>
          {/* end of row */}
        </div>
        {/* end of container-fluid */}
      </section>

      {/* Warning Section Ends */}
    </div>
  );
};

export default Login;
