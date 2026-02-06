import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL } from "../constant/constant";
import * as XLSX from "xlsx/xlsx.mjs";

import "./dashboard.css";
//import Chart from "chart.js/auto";
import "react-toastify/dist/ReactToastify.css";
import { Bar } from "react-chartjs-2";
import Loader from "../utils/Loader";
import toast from "react-hot-toast";

function Dashboard() {


  const roleId = sessionStorage.getItem('roleId');
  const clientId = sessionStorage.getItem('clientId');
  const departmentId = sessionStorage.getItem('departmentId')
   
  const [recordData, setRecordData] = useState([]);
  const [recordData1, setRecordData1] = useState([]);

  const [physicalRecordData, setPhysicalRecordData] = useState([])
  const [physicalRecordData1, setPhysicalRecordData1] = useState([])

  const [virtualMeetingCount, setVirtualMeetingCount] = useState({});
  const [physicalMeetingCount, setPhysicalMeetingCount] = useState({});
  const [filterBy, setFilterBy] = useState("");
  const [dateRange,setDateRange] = useState(false);
  const [sDate, setSDate] = useState("");
  const [eDate, setEDate] = useState("");
  const [meetingType, setMeetingType] = useState('');

  
  const [clientList, setClientList] = useState([]);
  const [clientId1, setClientId1] = useState('');
  const [departmentList, setDepartmentList] = useState([]);
  const [departmentId1, setDepartmentId1] = useState('');

  const [departmentVirtualList, setDepartmentVirtualList] = useState([]);
  const [departmentPhysicalList, setDepartmentPhysicalList] = useState([]);

  const [loader,setLoading] = useState(false);

  const handleFilter = (e) => {
    const filter = e.target.value
     if(filter === 'date'){
       setDateRange(true);
     }
     else{
      setDateRange(false);
      setSDate("");
      setEDate("")
      
     }
     setFilterBy(filter);
  };

  const getVirtualMeetingCount = async ()=>{
    try {
       const res = await axios.post(`${BASEURL}/admin/getVirtualMeetingCount`,{
         sdate : sDate, 
         edate : eDate,
         filterBy,
         roleId,
         clientId,
         departmentId
       });
       if(res.data.errorCode == 1){
         setVirtualMeetingCount(res.data.data);
       }
    } catch (error) {
      console.log(error)
    }
  }

  const getPhysicalMeetingCount = async ()=>{
    try {
       const res = await axios.post(`${BASEURL}/admin/getPhysicalMeetingCount`,{
         sdate:sDate, 
         edate:eDate,
         filterBy,
         roleId,
         clientId,
         departmentId
       });
       if(res.data.errorCode == 1){
         setPhysicalMeetingCount(res.data.data);
       }
    } catch (error) {
      console.log(error)
    }
  }


  const getVirtualMeetingRecord = async ()=>{
    setLoading(true);
    try {
       const res = await axios.post(`${BASEURL}/admin/getAllMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         filterBy,
         roleId,
         clientId : clientId ,
         departmentId : departmentId 
       });
       if(res.data.errorCode == 1){
         setRecordData(res.data.data);
         setRecordData1(res.data.data);

       }
    } catch (error) {
      console.log(error)
    }
    finally{
      setLoading(false);
    }
  }

  const getVirtualMeetingRecordDept = async (clientToUse)=>{
    try {
       const res = await axios.post(`${BASEURL}/admin/getAllMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         filterBy,
         roleId,
         clientId:clientToUse,
         departmentId:departmentId1 || departmentId
       });

       console.log("virtual list responce",res);
     
       if(res.data.errorCode == 1){
        setDepartmentVirtualList(res.data.data);
       }
    } catch (error) {
      console.log(error)
    }
  }

  const getPhysicalMeetingRecord = async ()=>{
    try {
       const res = await axios.post(`${BASEURL}/admin/getPhysicalMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         filterBy,
         roleId,
         clientId : clientId,
         departmentId : departmentId
       });
       if(res.data.errorCode == 1){
         setPhysicalRecordData(res.data.data);
         setPhysicalRecordData1(res.data.data);
       }
    } catch (error) {
      console.log(error)
    }
  }

  const getPhysicalMeetingRecordDept = async (clientToUse)=>{
    try {
       const res = await axios.post(`${BASEURL}/admin/getPhysicalMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         filterBy,
         roleId,
         clientId:clientToUse,
         departmentId:departmentId1 || departmentId
       });
       if(res.data.errorCode == 1){
        console.log("res physical", res)
         setDepartmentPhysicalList(res.data.data);
       }
    } catch (error) {
      console.log(error)
    }
  }


  

  useEffect(()=>{
    getPhysicalMeetingCount();
    getVirtualMeetingCount();
    if(departmentId1 || roleId ==202){
      let clientToUse = clientId1 || clientId;

    if(clientToUse !=='null' && clientToUse){
      getVirtualMeetingRecordDept(clientToUse);
      getPhysicalMeetingRecordDept(clientToUse);
     }
    }
    else{
      getVirtualMeetingRecord();
      getPhysicalMeetingRecord();
    }
  },[sDate,eDate,filterBy])

 
  useEffect(()=>{
    if(roleId == 200){
      if(meetingType){
        if(meetingType === 'virtual'){
          getVirtualMeetingRecord();
        }
        else{
          getPhysicalMeetingRecord();
        }
      }
    }
    else if(roleId == 201){
      let clientToUse = clientId1 || clientId;

    if(clientToUse !=='null' && clientToUse){
      getVirtualMeetingRecordDept(clientToUse);
      getPhysicalMeetingRecordDept(clientToUse);
     }
    }
    else{
      let clientToUse = clientId1 || clientId;

    if(clientToUse !=='null' && clientToUse){
      getVirtualMeetingRecordDept(clientToUse);
      getPhysicalMeetingRecordDept(clientToUse);
     }
    }
  },[meetingType])



  
  const getClient = async()=>{
      try {
          const res = await axios.get(`${BASEURL}/auth/getClient`);
          console.log("inside get client",res);
          if(res.data.errorCode ==1){
            setClientList(res.data.data);
          }
      } catch (error) {
        console.log(error)  
      }
  }
  const getDepartment = async(clientToUse)=>{
    try {
        const res = await axios.post(`${BASEURL}/auth/getDepartment`,{clientId:clientToUse});
        console.log("depatment responce", res)
        if(res.data.errorCode ==1){
          setDepartmentList(res.data.data);
        }
    } catch (error) {
      console.log(error)  
    }
}
 
  useEffect(()=>{
    getClient();
  },[])

  useEffect(()=>{
    let clientToUse = clientId1 || clientId;
      if(clientToUse !=='null' && clientToUse){
       console.log("ok testing",clientToUse) 
    getDepartment(clientToUse);
      }
      if(roleId == 200){
        getFilterClient(clientId1)
      }
  },[clientId1,clientId]);

  function getFilterClient(clientId1){
    // console.log(physicalRecordData)
    console.log("record data",recordData)
    if(clientId1){
      let filterPhysicalMeetingData = physicalRecordData1.filter((e)=>e.ClientCode ==clientId1)
    let filterVirtualMeetingData = recordData1.filter((e)=>e.ClientCode ==clientId1)
    //console.log("filter virtual meeting data",filterVirtualMeetingData)

    setPhysicalRecordData(filterPhysicalMeetingData);
    setRecordData(filterVirtualMeetingData);
    }
    else{
      getVirtualMeetingRecord();
      getPhysicalMeetingRecord();
    }
    
  }

  useEffect(()=>{

    console.log("inside it")
    let clientToUse = clientId1 || clientId;
    console.log("client to used",clientToUse)
    if(clientToUse !=='null' && clientToUse){
      getVirtualMeetingRecordDept(clientToUse);
      getPhysicalMeetingRecordDept(clientToUse);
     }
    
    
  },[departmentId1])
  
  
  // for excel file download
    const handelReportDownload = () => {
      // Define custom column headers
      const headers = [
        "Client Name",
        "Department Name",
        "Meeting Type",
        "Total Meetings",
        "Upcoming Meetings",
        "Completed Meetings",
      ];
       let data;
       let meetingType;
       if(meetingType === 'physical'){
         data = physicalRecordData;
         meetingType = 'Physical'
       }
       else{
        data = recordData;
        meetingType = 'Virtual'
       }
      // Map the data to match the custom column headers
      const mappedData = data.map((item) => ({
        "Client Name": item.FullName,
        "Department Name":item.DeptName,
        "Meeting Type": meetingType,
        "Total Meetings" : item.totalMeeting,
        "Upcoming Meetings" : item.totalUpcomingMeeting,
        "Completed Meetings" : item.totalCompletedMeeting,
      }));
  
      const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      const rn = Math.floor(Math.random()*1000)+1;
      XLSX.writeFile(wb, `ClientMeetingData_${rn}.xlsx`);
    };
  
    const handelSingalReportDownload = async (id) => {
      try {
        let res;
        if(meetingType ==='physical'){
         res = await axios.post(`${BASEURL}/admin/getPhysicalMeetingWithClientId`, 
            { sdate:sDate, 
              edate:eDate,
              filterBy,
              searchName:"",
              clientCode:id
             });

             console.log("inside meeting",res);  
             const filterData = res?.data?.data;
             const headers = [
               "Meeting Date",
               "Meeting Start Date",
               "Meeting End Date",
               "Meeting Title",
               "Client Name",
               "DepartMent Name",
               "Coordinator Name",
               "Mobile",
               "CreatedDateTime",
               "CreatedBy"
             ];
         
             // Map the data to match the custom column headers
             const mappedData = filterData.map((item) => ({
             "Meeting Date": item.EventDate,
             "Meeting Start Date" : item.EventStartDateTime,
             "Meeting End Date" : item.EventEndDateTime,
             "Meeting Title" : item.Title,
             "Client Name" : item.FullName,
             "DepartMent Name": item.DeptName,
             "Coordinator Name" : item.Name,
             "Mobile":item.Mobile,
             "CreatedDateTime":item.CreatedDateTime             ,
             "CreatedBy": item.displayname,
             }));
             // Generate Excel
             const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
             const wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, "Data");
             const rn = Math.floor(Math.random()*1000)+1;
             XLSX.writeFile(wb, `PhysicalMeetingClientWiseData_${rn}.xlsx`);
        }
        else{
           res = await axios.post(`${BASEURL}/admin/getVirtualMeetingWithClientId`, 
            { sdate:sDate, 
              edate:eDate,
              filterBy,
              searchName:"",
              clientCode:id
             });

             console.log("inside meeting",res);  
             const filterData = res?.data?.data;
             const headers = [
               "Meeting Date",
               "Meeting Start Date",
               "Meeting End Date",
               "Join Url",
               "Meeting Id",
               "Meeting Title",
               "Zoom Account Name",
               "Client Name",
               "DepartMent Name",
               "Coordinator Name",
               "Mobile",
               "CreatedDateTime",
               "CreatedBy"
             ];
         
             const mappedData = filterData.map((item) => ({
              "Meeting Date": item.EventDate,
              "Meeting Start Date" : item.EventStartDateTime,
              "Meeting End Date" : item.EventEndDateTime,
              "Join Url":item.AttendeeUrl,
              "Meeting Id":item.MeetingId,              
              "Meeting Title" : item.Title,
              "Zoom Account Name": item.Account_name,
              "Client Name" : item.FullName,
              "DepartMent Name": item.DeptName,
              "Coordinator Name" : item.Name,
              "Mobile":item.Mobile,
              "CreatedDateTime":item.CreatedDateTime             ,
              "CreatedBy": item.displayname,
              }));
             // Generate Excel
             const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
             const wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, "Data");
             const rn = Math.floor(Math.random()*1000)+1;
             XLSX.writeFile(wb, `VirtualMeetingClientWiseData_${rn}.xlsx`);
        }  
      } catch (error) {
        console.log(error);
      }
    };


    const handelSingalDepartMentReportDownload = async (id,EventType=null) => {
      try {
        let res;
        if(meetingType ==='physical' || EventType == 'EVTPHYSICAL'){
         res = await axios.post(`${BASEURL}/admin/getPhysicalMeetingWithClientId`, 
            { sdate:sDate, 
              edate:eDate,
              filterBy,
              searchName:"",
              departmentId:id
             });

             console.log("inside meeting",res);  
             const filterData = res?.data?.data;
             const headers = [
               //"Meeting Date",
               "Meeting Start Date",
               "Meeting Start Time",
               "Meeting End Date",
               "Meeting End Time",
               "Meeting Title",
               "Client Name",
               "DepartMent Name",
               "Coordinator Name",
               "Mobile",
               "CreatedDateTime",
               "CreatedBy"
             ];
         
             // Map the data to match the custom column headers
             const mappedData = filterData.map((item) => ({
             //"Meeting Date": item.EventDate,
             "Meeting Start Date" : item.EventStartDate,
             "Meeting Start Time" : item.EventStartTime,
             "Meeting End Date" : item.EventEndDate,
             "Meeting End Time" : item.EventEndTime,
             "Meeting Title" : item.Title,
             "Client Name" : item.FullName,
             "DepartMent Name": item.DeptName,
             "Coordinator Name" : item.Name,
             "Mobile":item.Mobile,
             "CreatedDateTime":item.CreatedDateTime             ,
             "CreatedBy": item.displayname,
             }));
             // Generate Excel
             const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
             const wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, "Data");
             const rn = Math.floor(Math.random()*1000)+1;
             XLSX.writeFile(wb, `PhysicalMeetingClientWiseData_${rn}.xlsx`);
        }
        else{
           res = await axios.post(`${BASEURL}/admin/getVirtualMeetingWithClientId`, 
            { sdate:sDate, 
              edate:eDate,
              filterBy,
              searchName:"",
              departmentId:id
             });

             console.log("inside excel filter",res);  
             const filterData = res?.data?.data;
             const headers = [
              "Meeting Start Date",
              "Meeting Start Time",
              "Meeting End Date",
              "Meeting End Time",
               "Join Url",
               "Meeting Id",
               "Meeting Title",
               "Zoom Account Name",
               "Client Name",
               "DepartMent Name",
               "Coordinator Name",
               "Mobile",
               "CreatedDateTime",
               "CreatedBy"
             ];
         
             const mappedData = filterData.map((item) => ({
              "Meeting Start Date" : item.EventStartDate,
             "Meeting Start Time" : item.EventStartTime,
             "Meeting End Date" : item.EventEndDate,
             "Meeting End Time" : item.EventEndTime,
              "Join Url":item.AttendeeUrl,
              "Meeting Id":item.MeetingId,              
              "Meeting Title" : item.Title,
              "Zoom Account Name": item.Account_name,
              "Client Name" : item.FullName,
              "DepartMent Name": item.DeptName,
              "Coordinator Name" : item.Name,
              "Mobile":item.Mobile,
              "CreatedDateTime":item.CreatedDateTime             ,
              "CreatedBy": item.displayname,
              }));
             // Generate Excel
             const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
             const wb = XLSX.utils.book_new();
             XLSX.utils.book_append_sheet(wb, ws, "Data");
             const rn = Math.floor(Math.random()*1000)+1;
             XLSX.writeFile(wb, `VirtualMeetingClientWiseData_${rn}.xlsx`);
        }  
      } catch (error) {
        console.log(error);
      }
    };

    const handelShowExcel = ()=>{
      window.open(
        "https://docs.google.com/spreadsheets/d/1W1jP6-wmjaqQKZ4__QxdO1PyQVmF3sjDmyXN70hUP_U/edit?gid=0#gid=0",
        "_blank"
      );
    }


    // for department role 
  const [virtualMeetingList, setVirtualMeetingList] = useState([]);
  const [physicalMeetingList, setPhysicalMeetingList] = useState([]);
  const [virtualMeetingList1, setVirtualMeetingList1] = useState([]);
  const [physicalMeetingList1, setPhysicalMeetingList1] = useState([]);
  const [meetingState, setMeetingState] = useState("")
  const getVirtualMeeting = async ()=>{
    let clientUse;
    let departmentUse;
    if(roleId == 200){
      clientUse = clientId1
      departmentUse = departmentId1
    }
    else if(roleId == 202){
      clientUse = clientId
      departmentUse = departmentId
    }
    else{
      clientUse = clientId
      departmentUse = departmentId1
    }
    // if(!searchQuery){
    //   setLoading(true)
    // }
    try {
       const res = await axios.post(`${BASEURL}/admin/getAllVirtualMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         searchName:'',
         filterBy,
         roleId,
         clientId : clientUse,
         departmentId:departmentUse
       });
       
       
       if(res.data.errorCode == 1){
         setVirtualMeetingList(res.data.data);
         setVirtualMeetingList1(res.data.data);
       }
    } catch (error) {
      //console.log("isnide error",error.response.data)
      toast.error(error.response.data.message)
      console.log(error)
    }
    finally{
      setLoading(false);
    }
  }

  const getPhysicalMeeting = async ()=>{

    let clientUse;
    let departmentUse;
    if(roleId == 200){
      clientUse = clientId1
      departmentUse = departmentId1
    }
    else if(roleId == 202){
      clientUse = clientId
      departmentUse = departmentId
    }
    else{
      clientUse = clientId
      departmentUse = departmentId1
    }
    //setLoading(true)
    try {
       const res = await axios.post(`${BASEURL}/admin/getAllPhysicalMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         searchName:'', 
         filterBy,
         roleId,
         clientId : clientUse,
         departmentId:departmentUse
       });
       
       if(res.data.errorCode == 1){
         setPhysicalMeetingList(res.data.data);
         setPhysicalMeetingList1(res.data.data);
       }
    } catch (error) {
      //console.log("isnide error",error.response.data)
      toast.error(error.response.data.message)
      console.log(error)
    }
    // finally{
    //   setLoading(false);
    // }
  }


  useEffect(()=>{
    
      getPhysicalMeeting();
      getVirtualMeeting();
    
  },[sDate,eDate,filterBy])

  
  useEffect(()=>{
    if(meetingType){
      if(meetingType === 'virtual'){
        getVirtualMeeting();
      }
      else{
        getPhysicalMeeting();
      }
    }
  },[meetingType])


  useEffect(()=>{
    getVirtualMeeting();
    getPhysicalMeeting();  
  },[clientId1,departmentId1])

  const handelOptionChange = (event)=>{
      const selectedValue = event.target.value;
      setMeetingState(selectedValue);
  
      const now = new Date();
  
      if(meetingType ==='physical'){
        const filtered = physicalMeetingList1.filter((meeting) => {
          const meetingDate = new Date(meeting.EventStartDateTime1);
    
          if (selectedValue === "upcoming") {
            return meetingDate > now; // Filter upcoming meetings
          } else if (selectedValue === "previous") {
            return meetingDate < now; // Filter completed meetings
          } else {
            return true; // Show all meetings
          }
        });
    
        setPhysicalMeetingList(filtered);
      }
      else if(meetingType === 'virtual'){
        const filtered = virtualMeetingList1.filter((meeting) => {
          const meetingDate = new Date(meeting.EventStartDateTime1);
    
          if (selectedValue === "upcoming") {
            return meetingDate > now; // Filter upcoming meetings
          } else if (selectedValue === "previous") {
            return meetingDate < now; // Filter completed meetings
          } else {
            return true; // Show all meetings
          }
        });
    
        setVirtualMeetingList(filtered);
      }
      else{
        const filtered1 = physicalMeetingList1.filter((meeting) => {
          const meetingDate = new Date(meeting.EventStartDateTime1);
    
          if (selectedValue === "upcoming") {
            return meetingDate > now; // Filter upcoming meetings
          } else if (selectedValue === "previous") {
            return meetingDate < now; // Filter completed meetings
          } else {
            return true; // Show all meetings
          }
        });
    
        setPhysicalMeetingList(filtered1);
        const filtered2 = virtualMeetingList1.filter((meeting) => {
          const meetingDate = new Date(meeting.EventStartDateTime1);
    
          if (selectedValue === "upcoming") {
            return meetingDate > now; // Filter upcoming meetings
          } else if (selectedValue === "previous") {
            return meetingDate < now; // Filter completed meetings
          } else {
            return true; // Show all meetings
          }
        });
    
        setVirtualMeetingList(filtered2);
      }

    
  }
  
  

  let combinedList = [
    ...virtualMeetingList,...physicalMeetingList
  ]

  const combinedDeptList = [
    ...(departmentPhysicalList?.map((item) => ({ ...item, EventType: "EVTPHYSICAL" })) || []),
    ...(departmentVirtualList?.map((item) => ({ ...item, EventType: "EVTVIRTUAL" })) || []),
  ];

  const combinedRecordList = [
    ...(recordData?.map((item) => ({ ...item, EventType: "EVTVIRTUAL" })) || []),
    ...(physicalRecordData?.map((item) => ({ ...item, EventType: "EVTPHYSICAL" })) || []),
  ];

  return loader ? <Loader/> : (
    <div className="container-fluid">
     
      <div className="row">
        <div className="col-xl-2 col-md-4 mb-4 mx-auto">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Meetings
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {virtualMeetingCount.totalMeeting + physicalMeetingCount.totalMeeting}
                  </div>
                </div>
                <div className="col-auto">
                <i className="fas fa-boxes fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repeat similar card elements for Total Doctors, Patients Screened, and Patients Diagnosed */}

        <div className="col-xl-2 col-md-4 mb-4 mx-auto">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Virtual Meetings
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {virtualMeetingCount.totalMeeting}
                  </div>
                </div>
                <div className="col-auto">
                <i className="fas fa-laptop fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 mb-4 mx-auto">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Physical Meetings
                  </div>
                  <div className="row no-gutters align-items-center">
                    <div className="col-auto">
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                      {physicalMeetingCount.totalMeeting}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-2 col-md-4 mb-4 mx-auto">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                   Total Upcoming Meetings
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {virtualMeetingCount.totalUpcomingMeeting + physicalMeetingCount.totalUpcomingMeeting}
                  </div>
                </div>
                <div className="col-auto">
                <i className="fas fa-exclamation-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="col-xl-2 col-md-4 mb-4 mx-auto">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Total Completed Meetings
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                  {virtualMeetingCount.totalCompletedMeeting + physicalMeetingCount.totalCompletedMeeting}
                 
                  </div>
                </div>
                <div className="col-auto">
                <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      <div className="d-sm-flex align-items-center justify-content-end mb-4">
        {/* <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
        
        </form> */}

        {roleId == 200 && <div className="dropdown ml-2 mt-3">
    <select className="form-control selectStyle"
          value={clientId1} onChange={(e)=>{
           setClientId1(e.target.value)
    }}>
        <option value="">Select Client</option> 
        {clientList.length>0 && clientList.map((client)=>(
          <option key={client.ClientCode} value={client.ClientCode}>{client.FullName}</option>
        ))}  
      </select>
        </div>}

        {(roleId == 200 || roleId == 201) && <div className="dropdown ml-2 mt-3">
    <select className="form-control selectStyle"
          value={departmentId1} 
          onChange={(e)=>{
           setDepartmentId1(e.target.value)
    }}>
        <option value="">Select Department</option> 
        {departmentList.length>0 && departmentList.map((dept)=>(
          <option key={dept.DeptId} value={dept.DeptId}>{dept.DeptName}</option>
        ))}  
      </select>
        </div>}

        <div className="dropdown ml-2 mt-3">
    <select className="form-control selectStyle"
     value={meetingType} onChange={(e)=>{
     setMeetingType(e.target.value)
    }}>
        <option value="">Select Meeting Type</option>   
        <option value="virtual">Virtual</option>
        <option value="physical">Physical</option>
      </select>
      </div>



        <div className="dropdown ml-2 mt-3">
            
        <select
                  className="form-control form-control1 selectStyle"
                   onChange={handleFilter}
                   value={filterBy}
                >
                  <option value="">Select Filter</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="date">Date Range</option>
                </select>
          
        </div>
   
      
        
       {dateRange && <>
        <div className="form-group ml-2"
        onClick={() => document.getElementById('DateInput1').showPicker()}>
          <label htmlFor="fromDate">From Date:</label>
          <input
            type="date"
            className="form-control"
            id="DateInput1"
            placeholder="Select From Date"
            value={sDate}
            onChange={(e) => setSDate(e.target.value)}
          />
        </div>

        
        <div className="form-group ml-2"
        onClick={() => document.getElementById('DateInput2').showPicker()}>
          <label htmlFor="toDate">To Date:</label>
          <input
            id= "DateInput2"
            type="date"
            className="form-control"
            placeholder="Select To Date"
            value={eDate}
            onChange={(e) => setEDate(e.target.value)}
          />
        </div></>}
      </div>
      <div className="card shadow mb-4">
        {roleId == 202 ? 
        <select className="form-select mt-2 p-1 ml-2 rounded b-color select-style" value={meetingState} onChange={handelOptionChange}>
        <option value="">All Meetings</option>
        <option value="upcoming">Upcoming</option>
        <option value="previous">Completed</option>
       </select>:
        <div className="card-header py-3">
          <button
             onClick={handelReportDownload}
            className="d-sm-inline-block btn btn-sm btn-info shadow-sm"
          >
            <i className="fas fa-download fa-sm text-white-50"></i> Download
            Report
          </button>

          <button
             onClick={handelShowExcel}
            className="d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2"
          >
            <i className="fas fa-external-link-alt fa-sm text-white-50"></i> Show Excel
          </button>
          {/* <button
             onClick={handelAllReportDownload}
            className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2"
          >
            <i className="fas fa-download fa-sm text-white-50"></i> Download All
            Report
          </button> */}
        </div>}
        <div className="card-body">
        <small className="msgnote mt-2">*Scroll left for other column of table</small>
          {roleId == 202 ? <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
            >
              <thead>
                <tr>
                  <th>Meeting Title</th>
                  <th>Meeting Start Date</th>
                  <th>Meeting End Date</th>
                  <th>Meeting Type</th>
                  <th>Client Name</th>
                  <th>Department Name</th>
                  {/* <th>Action</th> */}
                </tr>
              </thead>
              <tbody>
                {meetingType ==='physical' ? 
                (physicalMeetingList &&
                  physicalMeetingList.map((e) => {
                    return (
                      <tr key={e.WcCode}>
                        <td>{e.Title}</td>
                        <td>{e.EventStartDateTime}</td>
                        <td>{e.EventEndDateTime}</td>
                        <td>{"Physical"}</td>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        {/* <td>
                              <div className="dropdown-container-box">
                                  <button className="gear-button-box">
                                    <i className="fas fa-cog"></i>
                                  </button>

                                  <div className="dropdown-menu-box">
                                  
                                    <button className="dropdown-item-box" onClick={()=>handelInfo(e.WcCode)}>
                                      <i className="fas fa-info"></i> Information
                                    </button>
                                   
                                  </div>
                                </div>
                              </td> */}
                      </tr>
                    );
                  })) : meetingType ==='virtual' ? 
                  (virtualMeetingList &&
                  virtualMeetingList.map((e) => {
                    return (
                      <tr key={e.WcCode}>
                        <td>{e.Title}</td>
                        <td>{e.EventStartDateTime}</td>
                        <td>{e.EventEndDateTime}</td>
                        <td>{"Virtual"}</td>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        {/* <td>
                              <div className="dropdown-container-box">
                                  <button className="gear-button-box">
                                    <i className="fas fa-cog"></i>
                                  </button>

                                  <div className="dropdown-menu-box">
                                  
                                    <button className="dropdown-item-box" onClick={()=>handelInfo(e.WcCode)}>
                                      <i className="fas fa-info"></i> Information
                                    </button>
                                   
                                  </div>
                                </div>
                              </td> */}
                      </tr>
                    );
                  })) : (combinedList &&
                    combinedList.map((e) => {
                      return (
                        <tr key={e.WcCode}>
                          <td>{e.Title}</td>
                          <td>{e.EventStartDateTime}</td>
                          <td>{e.EventEndDateTime}</td>
                          <td>{e.EventType === 'EVTPHYSICAL' ? "Physical" : "Virtual"}</td>
                          <td>{e.FullName}</td>
                          <td>{e.DeptName}</td>
                        </tr>
                      );
                    }))}
              </tbody>
            </table> :
            <div className="table-responsive">
            {(departmentId1!==null && departmentId1 || roleId == 202) ? 
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
            >
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Department Name</th>
                  <th>Meeting Type</th>
                  <th>Total Meetings</th>
                  <th>Upcoming Meetings</th>
                  <th>Completed Meetings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {meetingType==='physical' ? (departmentPhysicalList.length>0 &&
                  departmentPhysicalList.map((e) => {
                    return (
                      <tr key={e.DeptId}>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        <td>{"Physical"}</td>
                        <td>{e.totalMeeting}</td>
                        <td>{e.totalUpcomingMeeting}</td>
                        <td>{e.totalCompletedMeeting}</td>
                        <td>
                          <button
                            className="btn-sm btn-primary btn-circle"
                            title="All Record Data"
                            style={{ border: "none" }}
                            onClick={() => handelSingalDepartMentReportDownload(e.DeptId)}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })): meetingType==='virtual' ? ( departmentVirtualList.length>0 &&
                  departmentVirtualList.map((e) => {
                    return (
                      <tr key={e.DeptId}>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        <td>{"Virtual"}</td>
                        <td>{e.totalMeeting}</td>
                        <td>{e.totalUpcomingMeeting}</td>
                        <td>{e.totalCompletedMeeting}</td>
                        <td>
                          <button
                            className="btn-sm btn-primary btn-circle"
                            title="All Record Data"
                            style={{ border: "none" }}
                            onClick={() => handelSingalDepartMentReportDownload(e.DeptId)}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })) : (combinedDeptList.length>0 &&
                    combinedDeptList.map((e,i) => {
                      return (
                        <tr key={i}>
                          <td>{e.FullName}</td>
                          <td>{e.DeptName}</td>
                          <td>{e.EventType == 'EVTPHYSICAL' ? "Physical" :"Virtual"}</td>
                          <td>{e.totalMeeting}</td>
                          <td>{e.totalUpcomingMeeting}</td>
                          <td>{e.totalCompletedMeeting}</td>
                          <td>
                            <button
                              className="btn-sm btn-primary btn-circle"
                              title="All Record Data"
                              style={{ border: "none" }}
                              onClick={() => handelSingalDepartMentReportDownload(e.DeptId,e.EventType)}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    }))}
                
              </tbody>
            </table>  :  
            
            
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
            >
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Department Name</th>
                  <th>Meeting Type</th>
                  <th>Total Meetings</th>
                  <th>Upcoming Meetings</th>
                  <th>Completed Meetings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {meetingType==='physical' ? (physicalRecordData &&
                  physicalRecordData.map((e) => {
                    return (
                      <tr key={e.DeptId}>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        <td>{"Physical"}</td>
                        <td>{e.totalMeeting}</td>
                        <td>{e.totalUpcomingMeeting}</td>
                        <td>{e.totalCompletedMeeting}</td>
                        <td>
                          <button
                            className="btn-sm btn-primary btn-circle"
                            title="All Record Data"
                            style={{ border: "none" }}
                           // onClick={() => handelSingalReportDownload(e.ClientCode)}
                           onClick={() => handelSingalDepartMentReportDownload(e.DeptId)}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })): meetingType==='physical' ?
                  (recordData &&
                  recordData.map((e) => {
                    return (
                      <tr key={e.DeptId}>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        <td>{"Virtual"}</td>
                        <td>{e.totalMeeting}</td>
                        <td>{e.totalUpcomingMeeting}</td>
                        <td>{e.totalCompletedMeeting}</td>
                        <td>
                          <button
                            className="btn-sm btn-primary btn-circle"
                            title="All Record Data"
                            style={{ border: "none" }}
                           // onClick={() => handelSingalReportDownload(e.ClientCode)}
                           onClick={() => handelSingalDepartMentReportDownload(e.DeptId)}
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })):(combinedRecordList &&
                    combinedRecordList.map((e,i) => {
                      return (
                        <tr key={i}>
                          <td>{e.FullName}</td>
                          <td>{e.DeptName}</td>
                          <td>{e.EventType == 'EVTPHYSICAL' ? "Physical" :"Virtual"}</td>
                          <td>{e.totalMeeting}</td>
                          <td>{e.totalUpcomingMeeting}</td>
                          <td>{e.totalCompletedMeeting}</td>
                          <td>
                            <button
                              className="btn-sm btn-primary btn-circle"
                              title="All Record Data"
                              style={{ border: "none" }}
                             // onClick={() => handelSingalReportDownload(e.ClientCode)}
                             onClick={() => handelSingalDepartMentReportDownload(e.DeptId,e.EventType)}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    }))}
                
              </tbody>
            </table>}
          </div>}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
