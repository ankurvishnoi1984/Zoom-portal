import { useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL } from "../constant/constant";
import { useNavigate } from "react-router-dom";
import "./login.css"

const Login = () => {

    const [username,setUserName] = useState("");
    const [password,setPassWord] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const handelSubmit = async(e)=>{
      e.preventDefault();
      //console.log(username,password)
      try {
        const res = await axios.post(`${BASEURL}/admin/login`,{username,password});
        console.log("login res",res);
        if(res.data.errorCode === "1"){
            const userId  = res.data.responseData.userId;
            const clientId  = res.data.responseData.clientCode;
            const roleId  = res.data.responseData.roleCode;
            const departmentId  = res.data.responseData.departmentCode;

            sessionStorage.setItem("IsAdminLoggedIn","true");
            sessionStorage.setItem('userId',userId);
            sessionStorage.setItem('clientId',clientId);
            sessionStorage.setItem('roleId', roleId);
            sessionStorage.setItem('departmentId', departmentId);
            navigate("/dashboard")
        }else{
            //console.log("details",res.response.data.details)
            setError("Invalid Credential");
        }
        
      } catch (error) {
        setError("Invalid Credential");
      }
    }

  return (
    <div className="bg-gradient-primary bglogin" style={{height:"100vh"}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-6 col-md-6">
            <div className="card o-hidden border-0 shadow-lg" style={{marginTop:"150px"}}>
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="p-5">
                      <div className="text-center">
                      
                                        <img src="./images/Logo.png" alt="logo img" style={{width:"50%",marginBottom:"20px"}} />
                                   
                      </div>
                      <form className="user" onSubmit={handelSubmit}>
                        <div className="form-group">
                          <input
                            type="text"
                            className="form-control form-control-user"
                            id="exampleInputEmail"
                            aria-describedby="emailHelp"
                            placeholder="Username"
                            onChange={(e)=>{
                              setUserName(e.target.value)
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className="form-control form-control-user"
                            id="exampleInputPassword"
                            placeholder="Password"
                            onChange={(e)=> setPassWord(e.target.value)}
                          />
                        </div>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <button
                          type="submit"
                          className="btn btn-primary btn-user btn-block"
                        >
                          Login
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
