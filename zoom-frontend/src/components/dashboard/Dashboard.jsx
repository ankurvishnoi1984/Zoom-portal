import React, { useContext, useEffect, useState } from "react";
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
      const res = await axios.post(`${API_URL}/physicalMeeting/getTotalMeet`,{sdate,edate,roleId});
      if(res.data.errorCode==="1"){
        setTotalPhysicalMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function getTotalVirtual(){
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getTotalMeet`,{sdate,edate,roleId});
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
      const res = await axios.post(`${API_URL}/physicalMeeting/getTotalUpcoming`,{sdate,edate,roleId});
      if(res.data.errorCode==="1"){
        setUpcomingPhysicalMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }
  
  async function getUpcomingVirtual(){
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getTotalUpcoming`,{sdate,edate,roleId});
      if(res.data.errorCode==="1"){
        setUpcomingVirtualMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }
  

  async function getCompletePhysical(){
    try {
      const res = await axios.post(`${API_URL}/physicalMeeting/getTotalCompleted`,{sdate,edate,roleId});
      if(res.data.errorCode==="1"){
        setCompletePhysicalMeet(res.data.data[0])
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function getCompleteVirtual(){
    try {
      const res = await axios.post(`${API_URL}/virtualMeet/getTotalCompleted`,{sdate,edate,roleId});
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
      const res = await axios.post(`${API_URL}/physicalMeeting/getMeetingWithStatus`, {mtype:meetingState1,searchName:searchName1,userId,roleId,sdate,edate});
       
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
      const res = await axios.post(`${API_URL}/virtualMeet/getMeetingWithStatus`,{mtype:meetingState,searchName,roleId,userId,sdate,edate});
      
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
      const res = await axios.post(`${API_URL}/virtualMeet/getMeetingData`,{sdate,edate,roleId,userId});

      setAllVirtualMeetingData(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getPhysicalMeetingData = async () => {
    try {
      const res = await axios.post(`${API_URL}/physicalMeeting/getMeetingData`,{sdate,edate,roleId,userId});

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
  <div className="stat-card stat-blue">
    <div className="stat-card-body">
      <div>
        <p className="stat-title">Total Meetings</p>
        <h2 className="stat-value">
          {(totalPhysicalMeet.totalMeeting || 0) +
           (totalVirtualMeet.totalMeeting || 0)}
        </h2>
      </div>

      <div className="stat-icon">
        <i className="ti-layout-grid2-alt"></i>
      </div>
    </div>
  </div>
</div>
   <div className="col-md-12 col-xl-4">
  <div className="stat-card stat-yellow">
    <div className="stat-card-body">
      <div>
        <p className="stat-title">Upcoming Meetings</p>
        <h2 className="stat-value">
          {(upcomingPhysicalMeet.totalUpcomingMeeting || 0) +
           (upcomingVirtualMeet.totalUpcomingMeeting || 0)}
        </h2>
      </div>

      <div className="stat-icon">
        <i className="ti-layout-grid2-alt"></i>
      </div>
    </div>
  </div>
</div>
<div className="col-md-12 col-xl-4">
  <div className="stat-card stat-green">
    <div className="stat-card-body">
      <div>
        <p className="stat-title">Completed Meetings</p>
        <h2 className="stat-value">
          {(completePhysicalMeet.totalCompletedMeeting || 0) +
           (completeVirtualMeet.totalCompletedMeeting || 0)}
        </h2>
      </div>

      <div className="stat-icon">
        <i className="ti-layout-grid2-alt"></i>
      </div>
    </div>
  </div>
</div>
               
                
              </div>

              <div className="row mt-2">
              <div className="col-md-12 col-xl-4">
  <div className="stat-card stat-blue">
    <div className="stat-card-body">
      <div>
        <p className="stat-title">Total {currentTab=== 1 ?"Virtual" :"Physical"} Meetings</p>
        <h2 className="stat-value">
          {currentTab===1 ? (totalVirtualMeet.totalMeeting || 0) :
           (totalPhysicalMeet.totalMeeting || 0)}
        </h2>
      </div>

      <div className="stat-icon">
        <i className="ti-layout-grid2-alt"></i>
      </div>
    </div>
  </div>
</div>
            
          <div className="col-md-12 col-xl-4">
  <div className="stat-card stat-yellow">
    <div className="stat-card-body">
      <div>
        <p className="stat-title">Upcoming {currentTab=== 1 ?"Virtual" :"Physical"} Meetings</p>
        <h2 className="stat-value">
          {currentTab===1 ? (upcomingVirtualMeet.totalUpcomingMeeting || 0) :
           (upcomingPhysicalMeet.totalUpcomingMeeting || 0)}
        </h2>
      </div>

      <div className="stat-icon">
        <i className="ti-layout-grid2-alt"></i>
      </div>
    </div>
  </div>
</div>
            <div className="col-md-12 col-xl-4">
  <div className="stat-card stat-green">
    <div className="stat-card-body">
      <div>
        <p className="stat-title">Completed {currentTab=== 1 ?"Virtual" :"Physical"} Meetings</p>
        <h2 className="stat-value">
          {currentTab===1 ? (completeVirtualMeet.totalCompletedMeeting  || 0) :
           (completePhysicalMeet.totalCompletedMeeting || 0)}
        </h2>
      </div>

      <div className="stat-icon">
        <i className="ti-layout-grid2-alt"></i>
      </div>
    </div>
  </div>
</div>    
                
              </div>

              {/* for role code */}
<div className="filter-bar-pro mt-3">

  {/* LEFT GROUP */}
  <div className="filter-left">

    {roleId === "101" ? (
      <>
        <div className="field-group">
          <label>Client</label>
          <select
            className="input-pro"
            value={clientValue}
            onChange={(e) => {
              setClientValue(e.target.value);
              handelSetClientId(e.target.value);
            }}
          >
            <option value="">Select client</option>
            {client?.map((e) => (
              <option key={e.ClientCode} value={e.ClientCode}>
                {e.FullName}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label>Department</label>
          <select
            className="input-pro"
            value={departmentValue}
            onChange={(e) => {
              setDepartmentValue(e.target.value);
              handelSetDeptId(e.target.value);
            }}
          >
            <option value="">Select department</option>
            {department?.map((e) => (
              <option key={e.DeptId} value={e.DeptId}>
                {e.DeptName}
              </option>
            ))}
          </select>
        </div>
      </>
    ) : (
      <div className="field-group">
        <label>Department</label>
        <select
          className="input-pro"
          value={departmentValue}
          onChange={(e) => {
            setDepartmentValue(e.target.value);
            handelSetDeptId(e.target.value);
          }}
        >
          {department?.map((e) => (
            <option key={e.DeptId} value={e.DeptId}>
              {e.DeptName}
            </option>
          ))}
        </select>
      </div>
    )}

    <div className="field-group">
      <label>From Date</label>
      <input
        type="date"
        className="input-pro"
        value={sdate}
        onChange={(e) => setSDate(e.target.value)}
      />
    </div>

    <div className="field-group">
      <label>To Date</label>
      <input
        type="date"
        className="input-pro"
        value={edate}
        onChange={(e) => setEDate(e.target.value)}
      />
    </div>
  </div>

  {/* RIGHT GROUP */}
  <div className="filter-right">
    <button className="btn-primary-pro" onClick={handelSearchByDate}>
      Search
    </button>

    <button className="btn-outline-pro" onClick={handelPhysicalMeetDownload}>
      ⬇ Physical Report
    </button>

    <button className="btn-outline-pro" onClick={handelVirtulMeetDownload}>
      ⬇ Virtual Report
    </button>
  </div>
</div>

           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mt-3">
                <div className="m-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
  Meeting Details
</h2>
                </div>
                <div className="col-lg-12 col-xl-12">
                  <div className="sub-title"></div>

              <div className="flex gap-2 mb-3">
  <button
    onClick={() => handelTabChange(1)}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
      currentTab === 1
        ? "bg-blue-600 text-white shadow"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    Virtual Meeting
  </button>

  <button
    onClick={() => handelTabChange(2)}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
      currentTab === 2
        ? "bg-blue-600 text-white shadow"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    Physical Meeting
  </button>
</div>
                <div className="tab-content">
  {currentTab === 1 ? (
    <div>

      {/* 🔹 Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-wrap">

          <input
            type="search"
            placeholder="Search meetings..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="h-10 w-64 rounded-full border border-blue-200 bg-white px-4 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={meetingState}
            onChange={handelOptionChange}
            className="input-pro"
          >
            <option value="upcoming">Upcoming</option>
            <option value="previous">Completed</option>
          </select>
        </div>

        <Link
          to="/virtualMeeting"
          className="h-10 px-4 inline-flex items-center justify-center
                     rounded-lg bg-none bg-blue-600 text-white text-sm font-semibold
                     shadow-sm hover:bg-blue-700 transition"
        >
          + Add Meeting
        </Link>
      </div>

      {/* 🔹 Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full">

            {/* ✅ Header */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white">
                  Meeting Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-white">
                  Expire Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-white">
                  Actions
                </th>
              </tr>
            </thead>

            {/* ✅ Body */}
            <tbody className="divide-y divide-gray-100">
              {allvirtualMeeting?.map((e) => (
                <tr
                  key={e.WcCode}
                  className="hover:bg-gray-50 transition"
                >
                  {/* Meeting */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800 text-sm">
                      {e.Title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {e.EventStartDateTime}
                    </div>
                  </td>

                  {/* Expire */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {e.EventEndDateTime}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">

                      {/* View */}
                      <Link to={`/meetingDetails1/${e.WcCode}`}>
                        <button className="h-9 w-9 rounded-full bg-blue-600 text-white
                                           flex items-center justify-center shadow-sm
                                           hover:bg-blue-700 transition">
                          <i className="icofont icofont-eye text-sm"></i>
                        </button>
                      </Link>

                      {/* Edit */}
                      <Link to={`/editVirtualMeeting/${e.WcCode}`}>
                        <button className="h-9 w-9 rounded-full bg-sky-500 text-white
                                           flex items-center justify-center shadow-sm
                                           hover:bg-sky-600 transition">
                          <i className="icofont icofont-edit text-sm"></i>
                        </button>
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() =>
                          handelVirtualMeetDelete(
                            e.MeetingId,
                            e.WcCode,
                            e.AccountId
                          )
                        }
                        className="h-9 w-9 rounded-full bg-red-600 text-white
                                   flex items-center justify-center shadow-sm
                                   hover:bg-red-700 transition"
                      >
                        <i className="icofont icofont-trash text-sm"></i>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  ) : (
   <div>

  {/* 🔹 Toolbar */}
  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
    <div className="flex items-center gap-3 flex-wrap">

      <input
        type="search"
        placeholder="Search meetings..."
        value={searchName1}
        onChange={(e) => setSearchName1(e.target.value)}
        className="h-10 w-64 rounded-full border border-blue-200 bg-white px-4 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={meetingState1}
        onChange={handelOptionChange1}
        className="input-pro"
      >
        <option value="upcoming">Upcoming</option>
        <option value="previous">Completed</option>
      </select>
    </div>

    <Link
      to="/physicalMeeting"
      className="h-10 px-4 inline-flex items-center justify-center
                 rounded-lg bg-blue-600 text-white text-sm font-semibold
                 shadow-sm hover:bg-blue-700 transition"
    >
      + Add Meeting
    </Link>
  </div>

  {/* 🔹 Table Card */}
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

    <div className="overflow-x-auto">
      <table className="min-w-full">

        {/* Header */}
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white">
              Meeting Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white">
              Expire Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-white">
              Actions
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-100">
          {allphysicalMeeting?.map((e) => (
            <tr
              key={e.WcCode}
              className="hover:bg-gray-50 transition"
            >
              {/* Meeting */}
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-800 text-sm">
                  {e.Title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Created: {e.EventStartDateTime}
                </div>
              </td>

              {/* Expire */}
              <td className="px-6 py-4 text-sm text-gray-700">
                {e.EventEndDateTime}
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">

                  {/* View */}
                  <Link to={`/meetingDetails/${e.WcCode}`}>
                    <button className="h-9 w-9 rounded-full bg-blue-600 text-white
                                       flex items-center justify-center shadow-sm
                                       hover:bg-blue-700 transition">
                      <i className="icofont icofont-eye text-sm"></i>
                    </button>
                  </Link>

                  {/* Edit */}
                  <Link to={`/editPhysicalMeeting/${e.WcCode}`}>
                    <button className="h-9 w-9 rounded-full bg-sky-500 text-white
                                       flex items-center justify-center shadow-sm
                                       hover:bg-sky-600 transition">
                      <i className="icofont icofont-edit text-sm"></i>
                    </button>
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => phandelMeetingDelete(e.WcCode)}
                    className="h-9 w-9 rounded-full bg-red-600 text-white
                               flex items-center justify-center shadow-sm
                               hover:bg-red-700 transition"
                  >
                    <i className="icofont icofont-trash text-sm"></i>
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  </div>
</div>
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
