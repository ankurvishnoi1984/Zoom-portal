import React, { useContext, useEffect, useState } from "react";
// import "../../../assets/css/style.css";
// import "../../../assets/css/bootstrap/css/bootstrap.min.css";
// import "../../../assets/icon/themify-icons/themify-icons.css";
// import "../../../assets/icon/font-awesome/css/font-awesome.min.css";
// import "../../../assets/icon/icofont/css/icofont.css";
// import "../../../assets/css/jquery.mCustomScrollbar.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../utils/constant";
import { toast } from "react-toastify";
import Loader from "../../utils/Loader";
import * as XLSX from 'xlsx/xlsx.mjs';
import ConfirmationPopup from "../popup/Popup";
import { LoginContext } from "../../context/LoginContext";

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState(1);

  const [allphysicalMeeting, setAllPhysicalMeeting] = useState([]);
  const [allvirtualMeeting, setAllVirtualMeeting] = useState([]);

  const [totalPhysicalMeet, setTotalPhysicalMeet] = useState({});
  const [totalVirtualMeet, setTotalVirtualMeet] = useState({});

  const [upcomingPhysicalMeet, setUpcomingPhysicalMeet] = useState({});
  const [upcomingVirtualMeet, setUpcomingVirtualMeet] = useState({});

  const [completePhysicalMeet, setCompletePhysicalMeet] = useState({});
  const [completeVirtualMeet, setCompleteVirtualMeet] = useState({});

  const [virtualMeetingData, setAllVirtualMeetingData] = useState([])
  const [physicalMeetingData, setAllPhysicalMeetingData] = useState([])

  const [meetingState, setMeetingState] = useState("upcoming")
  const [meetingState1, setMeetingState1] = useState("upcoming")
  const [sdate, setSDate]= useState('');
  const [edate, setEDate] = useState('')
  const [searchName, setSearchName] = useState("")
  const [searchName1, setSearchName1] = useState("")


  const [laoder,setLoader] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmation1, setShowConfirmation1] = useState(false);

  const [meetingId, setPhysicalMeetingId] = useState(null);
  const [vmeetingId, setVirtualMeetingId] = useState(null);
  const [wccode, setWccode] = useState(null);
  const [accountId, setAccountId] = useState(null);

  //const {userId} = useContext(LoginContext);

  const userId = sessionStorage.getItem('userId');
  const roleId = sessionStorage.getItem('roleId');
  // for meeting count 
  
  console.log("userid", userId)
  async function getTotalPhysical(){
    try {
      const res = await axios.post(`${API_URL}/physicalMeeting/getTotalMeet`,{sdate,edate});
      if(res.data.errorCode==="1"){
        setTotalPhysicalMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function getTotalVirtual(){
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getTotalMeet`,{sdate,edate});
      if(res.data.errorCode==="1"){
        setTotalVirtualMeet(res.data.data[0])
      }
      //setLoader(false)
    } catch (error) {
      console.log(error)
      //setLoader(false)
    }
  }

  async function getUpcomingPhysical(){
    try {
      const res = await axios.post(`${API_URL}/physicalMeeting/getTotalUpcoming`,{sdate,edate});
      if(res.data.errorCode==="1"){
        setUpcomingPhysicalMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  async function getUpcomingVirtual(){
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getTotalUpcoming`,{sdate,edate});
      if(res.data.errorCode==="1"){
        setUpcomingVirtualMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }
  

  async function getCompletePhysical(){
    try {
      const res = await axios.post(`${API_URL}/physicalMeeting/getTotalCompleted`,{sdate,edate});
      if(res.data.errorCode==="1"){
        setCompletePhysicalMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function getCompleteVirtual(){
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getTotalCompleted`,{sdate,edate});
      if(res.data.errorCode==="1"){
        setCompleteVirtualMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(()=>{
     getTotalPhysical();
     getTotalVirtual();
     getUpcomingPhysical();
     getUpcomingVirtual();
     getCompletePhysical();
     getCompleteVirtual();
  },[])

 


  const handelTabChange = (value) => {
    setCurrentTab(value);
  };


  const getAllPhysicalMeeting = async () => {
   

    try {
     setLoader(true)
      const res = await axios.post(`${API_URL}/physicalMeeting/getMeetingWithStatus`, {mtype:meetingState1,searchName:searchName1});
       
      if(res.data.errorCode == "1"){

        setAllPhysicalMeeting(res.data.data);
        setLoader(false)
      }
    } catch (error) {
      setLoader(false)
      console.log(error);
    }
  };


  const getAllVirtualMeeting = async () => {
    
    try {
      setLoader(true)
      const res = await axios.post(`${API_URL}/virtualMeet/getMeetingWithStatus`,{mtype:meetingState,searchName});
      
      if(res.data.errorCode=="1"){
        setAllVirtualMeeting(res.data.data);
        setLoader(false)
      }
      
    } catch (error) {
      setLoader(false)
      console.log(error);
    }

  };

  const phandelMeetingDelete = async (id) => {
    setPhysicalMeetingId(id);
    setShowConfirmation(true);
    
  };

  const handleConfirm = async () => {
    const id = meetingId;
    try {
      setShowConfirmation(false);
      setLoader(true)
      console.log("inside delete", meetingId)
      const res = await axios.patch(
            `${API_URL}/physicalMeeting/deleteMeeting/${id}`
          );
          if(res.data.errorCode=="1"){
            toast.success("Physical Meeting Deleted")
           }
          getAllPhysicalMeeting();
          setLoader(false)
    } catch (error) {
      console.log(error);
      setLoader(false)
    } 
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleCancel1 = () => {
    setShowConfirmation1(false);
  };


  const handelVirtualMeetDelete = async(id,WcCode,hostId)=>{
    setAccountId(hostId);
    setWccode(WcCode);
    setVirtualMeetingId(id)
    setShowConfirmation1(true)
    
  }

  const handleConfirm1 = async () => {
    try {
      setShowConfirmation1(false);
      setLoader(true)
       const res = await axios.post(
        `${API_URL}/virtualMeet/deleteMeeting`,{hostId:accountId,mid:vmeetingId,wcid: wccode});
      if(res.data.errorCode=="1"){
        toast.success("Virtual Meeting Deleted")
       }
      getAllVirtualMeeting();
          setLoader(false)
    } catch (error) {
      console.log(error);
      setLoader(false)
    } 
  }
  // for report download 

  const getVirtualMeetingData = async () => {
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getMeetingData`,{sdate,edate});

      setAllVirtualMeetingData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getPhysicalMeetingData = async () => {
    try {
      const res = await axios.post(`${API_URL}/physicalMeeting/getMeetingData`,{sdate,edate});

      setAllPhysicalMeetingData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(()=>{
     getPhysicalMeetingData();
     getVirtualMeetingData();
  },[])

  


  
  const handelOptionChange = (e)=>{
    setMeetingState(e.target.value)
  }

  const handelOptionChange1 = (e)=>{
    setMeetingState1(e.target.value)
  }
  
  const  handelSearchByDate = async ()=>{

    //if(sdate && edate){
    //   getTotalPhysical();
    //  getTotalVirtual();
    //  getUpcomingPhysical();
    //  getUpcomingVirtual();
    //  getCompletePhysical();
    //  getCompleteVirtual();
    //}
    // else{
    //   alert("Please select start date and end date")
    // }
    //console.log("sdate", sdate, "edate", edate)
    setLoader(true)
   await getTotalPhysical();
   await getTotalVirtual();
   await getUpcomingPhysical();
   await getUpcomingVirtual();
   await getCompletePhysical();
   await getCompleteVirtual();
   await getVirtualMeetingData();
   await getPhysicalMeetingData();
    setLoader(false)
  }
 
  useEffect(()=>{
    getAllVirtualMeeting();
  },[meetingState])

  useEffect(()=>{
    getAllPhysicalMeeting();
  },[meetingState1])

  useEffect(()=>{
    
    let timer =setTimeout(()=>{
      getAllVirtualMeeting();
    },1000)
    
    return ()=>{
      clearTimeout(timer)
    }
  },[searchName])

  useEffect(()=>{
    
    let timer =setTimeout(()=>{
      getAllPhysicalMeeting();
    },1000)
    
    return ()=>{
      clearTimeout(timer)
    }
  },[searchName1])

  console.log("inside meeting data",virtualMeetingData,physicalMeetingData)
  
  const handelPhysicalMeetDownload = ()=>{
    // Define custom column headers
     const headers = [
      'Meeting Id',
      'Meeting Title',
      'Meeting Start Date',
      'Meeting Start Time',
      'Meeting Location',
      'Speaker Name',
      'Speaker Designation',
      'Coordinator Name',
      'Coordinator Mobile',
         
      ];

      // Map the data to match the custom column headers
      const mappedData = physicalMeetingData.map(item => ({
        'Meeting Id' : item.WcCode,
        'Meeting Title' :item.Title,
        'Meeting Start Date' : item.EventStartDate,
        'Meeting Start Time' : item.EventStartTime,
        'Meeting Location': item.EventLocation,
        'Speaker Name':item.SpkName,
        'Speaker Designation':item.SpkDesignation,
        'Coordinator Name' : item.Name,
        'Coordinator Mobile' : item.Mobile
        
      }));
  
      const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, 'PhysicalMeetingData.xlsx');

    
    
   }

   const handelVirtulMeetDownload = ()=>{
    // Define custom column headers
    
    const headers = [
      'Meeting Id',
      'Meeting Title',
      'Meeting Start Date',
      'Meeting Start Time',
      'Speaker Name',
      'Speaker Designation',
      'Coordinator Name',
      'Coordinator Mobile',
       
    ];

    // Map the data to match the custom column headers
    const mappedData = virtualMeetingData.map(item => ({
      'Meeting Id' : item.WcCode,
      'Meeting Title' :item.Title,
      'Meeting Start Date' : item.EventStartDate,
      'Meeting Start Time' : item.EventStartTime,
      'Speaker Name':item.SpkName,
      'Speaker Designation':item.SpkDesignation,
      'Coordinator Name' : item.Name,
      'Coordinator Mobile' : item.Mobile
      
    }));

    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'VirtualMeetingData.xlsx');

    
   }

   // for role code 

   //const [role, setRole]= useState('');
   const  {handelSetClientId,handelSetDeptId} = useContext(LoginContext)
   const [client, setClient] = useState([]);
   const [clientValue, setClientValue]= useState('');
   const [clientAdmin, setClientAdmin] = useState([])
   const [department,setDepartment]= useState([])
   const [departmentValue, setDepartmentValue] = useState('')
  //  const getRoleCode = async () => {
  //   try {
  //     const res = await axios.post(`${API_URL}/auth/getRoleCode`,{userId});
      
  //     if(res?.data?.errorCode === "1"){

  //       setRole(res?.data?.data[0]?.role_code)
  //     }
  //     else{
  //       alert("server error")
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };


  //  useEffect(()=>{
  //   getRoleCode()
  //  },[])


   const getClient = async () => {
   
    try {
    
      if(roleId ==="101"){

        const res = await axios.get(`${API_URL}/auth/getClient`);
     
      
      if(res?.data?.errorCode === "1"){

        setClient(res?.data?.data)
      }
      else{
        alert("server error")
      }
    }
    else{

      const res = await axios.post(`${API_URL}/auth/getClientAdmin`,{userId});
   
    
    if(res?.data?.errorCode === "1"){
      setClient(res?.data?.data)
      handelSetClientId(res?.data?.data[0].client_code)
      setClientAdmin(res?.data?.data)
    }
    else{
      alert("server error")
    }
  }
    } catch (error) {
      console.log(error);
    }
  };

   useEffect(()=>{
    getClient()
   },[])

   const getDepartment = async () => {
    try {

      let res;
      if(roleId==="101"){
         res = await axios.post(`${API_URL}/auth/getDepartment`,{clientId:clientValue});

      }
      else{
        res = await axios.post(`${API_URL}/auth/getDepartment`,{clientId:client[0].client_code});

      }
      
      if(res?.data?.errorCode === "1"){

        setDepartment(res?.data?.data)
      }
      else{
        alert("server error")
      }
    } catch (error) {
      console.log(error);
    }
  };
   
  
   useEffect(()=>{
    getDepartment()
   },[clientValue,clientAdmin])

   if(department.length===1){
    handelSetDeptId(department[0].DeptId)
   }

  return laoder ? <Loader/> : (
    <div className="pcoded-content">
      <div className="pcoded-inner-content">
        <div className="main-body">
          <div className="page-wrapper">
            <div className="page-body">
              <div className="row">
                <div className="col-md-12 col-xl-4">
                  <div className="card bg-c-blue order-card">
                    <div className="card-block">
                      <h6 className="m-b-20 fw-bold">Total Meetings</h6>
                      <h2 className="text-right">
                        <i className="ti-layout-grid2-alt f-left"></i>
                        <span>{(totalPhysicalMeet.totalMeeting) + (totalVirtualMeet.totalMeeting)}</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-xl-4">
                  <div className="card bg-c-yellow order-card">
                    <div className="card-block">
                      <h6 className="m-b-20 fw-bold">Upcoming Meetings</h6>
                      <h2 className="text-right">
                        <i className="ti-layout-grid2-alt f-left"></i>
                        <span>{(upcomingPhysicalMeet.totalUpcomingMeeting) + (upcomingVirtualMeet.totalUpcomingMeeting)}</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-xl-4">
                  <div className="card bg-c-green order-card">
                    <div className="card-block">
                      <h6 className="m-b-20 fw-bold">Completed Meetings</h6>
                      <h2 className="text-right">
                        <i className="ti-layout-grid2-alt f-left"></i>
                        <span>{(completePhysicalMeet.totalCompletedMeeting ) + (completeVirtualMeet.totalCompletedMeeting )}</span>
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12 col-xl-4">
                  <div className="card bg-c-blue order-card">
                    <div className="card-block">
                      <h6 className="m-b-20 fw-bold">Total {currentTab=== 1 ?"Virtual" :"Physical"} Meetings</h6>
                      <h2 className="text-right">
                        <i className="ti-layout-grid2-alt f-left"></i>
                        <span>{currentTab===1 ?  (totalVirtualMeet.totalMeeting):(totalPhysicalMeet.totalMeeting)}</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-xl-4">
                  <div className="card bg-c-yellow order-card">
                    <div className="card-block">
                      <h6 className="m-b-20 fw-bold">Upcoming {currentTab=== 1 ?"Virtual" :"Physical"} Meetings</h6>
                      <h2 className="text-right">
                        <i className="ti-layout-grid2-alt f-left"></i>
                        <span>{currentTab===1 ? (upcomingVirtualMeet.totalUpcomingMeeting):(upcomingPhysicalMeet.totalUpcomingMeeting)}</span>
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-12 col-xl-4">
                  <div className="card bg-c-green order-card">
                    <div className="card-block">
                      <h6 className="m-b-20 fw-bold">Completed {currentTab=== 1 ?"Virtual" :"Physical"} Meetings</h6>
                      <h2 className="text-right">
                        <i className="ti-layout-grid2-alt f-left"></i>
                        <span>{currentTab===1 ?(completeVirtualMeet.totalCompletedMeeting ):(completePhysicalMeet.totalCompletedMeeting )}</span>
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* for role code */}

              {roleId==="101"?(<div>

                <select onChange={(e)=>{
                   setClientValue(e.target.value);
                   handelSetClientId(e.target.value);
                }}
                value={clientValue}
                >
                  <option value="">select client</option>
                   {client && client.length>0 && client.map((e)=> <option key={e.ClientCode} value={e.ClientCode}>{e.FullName}</option> ) }

                </select>
                <select name="" id=""
                 onChange={(e)=>{
                  setDepartmentValue(e.target.value)
                  handelSetDeptId(e.target.value);
               }}
               value={departmentValue}
                 >
                   <option value="">select department</option>
                   {department && department.length>0 && department.map((e)=> <option key={e.DeptId} value={e.DeptId}>{e.DeptName}</option> ) }
                   

                </select>
              </div>):(<div>
                  
                {/* <select name="" id=""
                onChange={(e)=>{
                  setDepartmentValue(e.target.value)
                  handelSetDeptId(e.target.value);
               }}
               value={departmentValue}
                >
                   <option value="">select department</option>
                   {department && department.length>0 && department.map((e)=> <option key={e.DeptId} value={e.DeptId}>{e.DeptName}</option> ) }
                   

                </select> */}

<select
  name=""
  id=""
  onChange={(e) => {
    setDepartmentValue(e.target.value);
    handelSetDeptId(e.target.value);
  }}
  value={departmentValue}
>
  {department && department.length > 1 && departmentValue === '' && (
    <option value="" disabled>
      Select department
    </option>
  )}
  {department && department.length > 0 && department.map((e) => (
    <option key={e.DeptId} value={e.DeptId}>
      {e.DeptName}
    </option>
  ))}
</select>


              </div>)}

              <div className="d-sm-flex align-items-start justify-content-end mb-2">                               
                                                
                                                <div className="form-group ml-2 ">
                                                    <label htmlFor="fromDate">From Date:</label>
                                                    <input type="date" className="form-control"
                                                    value={sdate}
                                                     id="fromDate" placeholder="Select From Date" onChange={(e)=>setSDate(e.target.value)}/>
                                                </div>
                        
                                               
                                                <div className="form-group ml-2 ">
                                                    <label htmlFor="toDate">To Date:</label>
                                                    <input type="date" className="form-control"
                                                    value={edate}
                                                     id="toDate" placeholder="Select To Date" onChange={(e)=>setEDate(e.target.value)}/>
                                                </div>
                                                <div className=" ml-2 mt-4">
                                                    <button className="btn hor-grd btn-grd-primary mr-2 fw-bolder"
                                                    onClick={handelSearchByDate}>Search</button>
                                                    
                                                </div>

                                                <div className="ml-2">
                                                <button className="btn hor-grd btn-grd-primary mr-2 fw-bolder mt-4"
                                                      onClick={handelPhysicalMeetDownload}
                                                      > <i className="icofont icofont-download-alt"></i> Physical Meeting Report</button>
                                                      <button className="btn hor-grd btn-grd-primary fw-bolder mt-4"
                                                      onClick={handelVirtulMeetDownload}
                                                      > <i className="icofont icofont-download-alt"></i>Virtual Meeting Report</button>
                                                </div>
                                               
                        
                                            </div>
              <div className="card">
                <div className="m-3">
                  <h5 className="fw-bold">Meeting details</h5>
                </div>
                <div className="col-lg-12 col-xl-12">
                  <div className="sub-title"></div>

                  <ul className="nav nav-tabs">
                    <div className="nav-item" onClick={() => handelTabChange(1)}>
                      <a
                        className={`nav-link tabName ${
                          currentTab === 1 ? "active" : ""
                        }`}
                      >
                        Virtual Meeting
                      </a>
                    </div>
                    <div className="nav-item" onClick={() => handelTabChange(2)}>
                      <a
                        className={`nav-link tabName ${
                          currentTab === 2 ? "active" : ""
                        }`}
                      >
                        Physical Meeting
                      </a> 
                    </div>
                  </ul>
                
                  <div className="tab-content tabs tbstyle card-block">
                    {currentTab === 1 ? (
                      <div className="active">
                        <div className="d-flex justify-content-between">
                        <div className="input-group col-sm-12  col-md-12  col-lg-3 mt-2">
                            <input
                              type="search"
                              className="form-control form-control-round form-control-sm inputpc"
                              placeholder="Search"
                              value={searchName}
                              onChange={(e)=>setSearchName(e.target.value)}
                              style={{ borderRadius: "50px" }}
                            />
                             <div>
                             <select className="form-select p-1 ml-2 rounded b-color" value={meetingState} onChange={handelOptionChange}>
                              <option value="upcoming">Upcoming</option>
                              <option value="previous">Completed</option>
                             </select>
                          </div>
                          </div>
                           

                         

                          <Link to='/virtualMeeting'
                            className="btn btn-mat btn-primary rounded fw-bolder"
                            style={{ paddingTop: "15px" }}
                          >
                            {" "}
                            <i
                              className="icofont icofont-plus"
                              style={{ color: "#fff" }}
                            ></i>{" "}
                            Add Meeting
                          </Link>
                        </div>
                        <div className="input-group col-sm-12  col-md-12 mt-3">
                          <input
                             
                              type="search"
                              className="form-control form-control-round form-control-sm inputmobile"
                              placeholder="Search"
                              style={{ borderRadius: "50px" }}
                            />
                          </div>
                        <div className="card-block tbstyle table-border-style">
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Meeting Details</th>
                                  <th>Expire Date</th>
                                  {/* <th>Status</th> */}
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>

                              {allvirtualMeeting &&
                                  allvirtualMeeting.map((e) => (
                                    <tr key={e.WcCode}>
                                  <td>
                                    <h5>{e.Title}</h5>
                                    <span className="fs-5">Created:{e.EventStartDateTime}</span>
                                  </td>
                                  <td>
                                    <span className="fs-5">{e.EventEndDateTime}</span>
                                  </td>
                                  {/* <td>
                                  <label className={`label ${e.isPastEvent ?"label-warning":"label-success"}`}>
                                        {e.isPastEvent ?" Upcoming ":" Completed "}
                                        </label>
                                  </td> */}
                                  <td>
                                    <Link to={`/meetingDetails1/${e.WcCode}`}>
                                      <button className="btn btn-success btn-icon">
                                        <i className="icofont icofont-eye"></i>
                                      </button>
                                    </Link>

                                    <Link to={`/editVirtualMeeting/${e.WcCode}`}>
                                      <button className="btn btn-primary btn-icon ml-2">
                                        <i className="icofont icofont-edit"></i>
                                      </button>
                                    </Link>
                                    <button 
                                     onClick={()=>handelVirtualMeetDelete(e.MeetingId,e.WcCode,e.AccountId)}
                                    className="btn btn-danger btn-icon ml-2">
                                      <i className="icofont icofont-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                                  ))}
                               
                               
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : currentTab === 2 ? (
                      <div className="active">
                        <div className="d-flex justify-content-between">
                        <div className="input-group col-lg-3 mt-2">
                            <input
                              type="search"
                              className="form-control form-control-round form-control-sm inputpc"
                              placeholder="Search"
                              value={searchName1}
                              onChange={(e)=>setSearchName1(e.target.value)}
                              style={{ borderRadius: "50px" }}
                            />
                          <div>
                             <select value={meetingState1} className="form-select p-1 ml-2 rounded b-color"
                              onChange={handelOptionChange1}>
                              <option value="upcoming">Upcoming</option>
                              <option value="previous">Completed</option>
                             </select>
                          </div>
                          </div>


                          <Link to="/physicalMeeting"
                            className="btn btn-mat btn-primary rounded fw-bolder"
                            style={{paddingTop:"15px"}}
                          >
                            {" "}
                            <i
                              className="icofont icofont-plus"
                              style={{ color: "#fff" }}
                            ></i>{" "}
                            Add Meeting
                          </Link>
                        </div>
                        <div className="input-group col-sm-12  col-md-12 mt-3">
                          <input
                             
                              type="search"
                              className="form-control form-control-round form-control-sm inputmobile"
                              placeholder="Search"
                              style={{ borderRadius: "50px" }}
                            />
                          </div>
                        <div className="card-block tbstyle table-border-style">
                          <div className="table-responsive">
                            <table className="table table-hover">
                              <thead>
                                <tr>
                                  <th>Meeting Details</th>
                                  <th>Expire Date</th>
                                  {/* <th>Status</th> */}
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allphysicalMeeting &&
                                  allphysicalMeeting.map((e) => (
                                    <tr key={e.WcCode}>
                                      <td>
                                        <h5> {e.Title}</h5>
                                        <span className="fs-5">Created: {e.EventStartDateTime}</span>
                                      </td>
                                      <td>
                                        <span className="fs-5">{e.EventEndDateTime}</span>
                                      </td>
                                      {/* <td>
                                        <label className={`label ${e.isPastEvent ?"label-warning":"label-success"}`}>
                                        {e.isPastEvent ?" Upcoming ":" Completed "}
                                        </label>
                                      </td> */}
                                      <td>
                                        <Link to={`/meetingDetails/${e.WcCode}`}>
                                          <button className="btn btn-success btn-icon">
                                            <i className="icofont icofont-eye"></i>
                                          </button>
                                        </Link>
                                        <Link
                                          to={`/editPhysicalMeeting/${e.WcCode}`}
                                        >
                                          <button className="btn btn-primary btn-icon ml-2">
                                            <i className="icofont icofont-edit"></i>
                                          </button>
                                        </Link>
                                        <button
                                          onClick={() =>
                                            phandelMeetingDelete(e.WcCode)
                                          }
                                          className="btn btn-danger btn-icon ml-2"
                                        >
                                          <i className="icofont icofont-trash"></i>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div id="styleSelector"></div>
          </div>
        </div>
      </div>

      {showConfirmation && (
              <ConfirmationPopup
                message="Are you sure you want to Delete Meeting?"
                onConfirm={() => handleConfirm()}
                onCancel={handleCancel}
              />
            )}

{showConfirmation1 && (
              <ConfirmationPopup
                message="Are you sure you want to Delete Meeting?"
                onConfirm={() => handleConfirm1()}
                onCancel={handleCancel1}
              />
            )}
    </div>
  );
};

export default Dashboard;
