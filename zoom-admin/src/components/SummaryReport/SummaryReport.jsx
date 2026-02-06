import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL } from "../constant/constant";
import * as XLSX from "xlsx/xlsx.mjs";
import Loader1 from "../utils/Loader1";
import toast from "react-hot-toast";
import Loader from "../utils/Loader";
import "./SummaryReport.css"

function SummaryReport() {
  const roleId = sessionStorage.getItem('roleId');
  const clientId = sessionStorage.getItem('clientId');
  const departmentId = sessionStorage.getItem('departmentId')

  const [virtualMeetingList, setVirtualMeetingList] = useState([]);
  const [physicalMeetingList, setPhysicalMeetingList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("");

  const [sDate, setSDate] = useState("");
  const [eDate, setEDate] = useState("");
  const [dateRange, setDateRange] = useState(false);
  
  const [loader,setLoading] = useState(false);
  const [meetingType, setMeetingType] = useState('');
  const [showInfoModel, setShowInfoModel] = useState(false);
  const [infoData, setInfoData] = useState({});

  const [clientList, setClientList] = useState([]);
    const [clientId1, setClientId1] = useState('');
    const [departmentList, setDepartmentList] = useState([]);
    const [departmentId1, setDepartmentId1] = useState('');


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
    if(!searchQuery){
      setLoading(true)
    }
    try {
       const res = await axios.post(`${BASEURL}/admin/getAllVirtualMeetingWithClient`,{
         sdate:sDate, 
         edate:eDate,
         searchName:searchQuery,
         filterBy,
         roleId,
         clientId : clientUse,
         departmentId:departmentUse
       });
       
       
       if(res.data.errorCode == 1){
         setVirtualMeetingList(res.data.data);
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
         searchName:searchQuery, 
         filterBy,
         roleId,
         clientId : clientUse,
         departmentId:departmentUse
       });
       
       if(res.data.errorCode == 1){
         setPhysicalMeetingList(res.data.data);
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
    if(searchQuery){
      if(searchQuery.length>2){
        getPhysicalMeeting();
        getVirtualMeeting();
      }
    }
    else{
      getPhysicalMeeting();
      getVirtualMeeting();
    }
  },[sDate,eDate,searchQuery,filterBy])

  
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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // for excel file download
  const handelReportDownload = () => {
    // Define custom column headers

    if(meetingType === 'physical'){
      const headers = [
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
      const mappedData = physicalMeetingList.map((item) => ({
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
        "CreatedBy": item.displayname
      }));
     
    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const rn = Math.floor(Math.random()*1000)+1;
    XLSX.writeFile(wb, `PhysicalMeetingData_${rn}.xlsx`);
    }
    else{
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
  
      const mappedData = virtualMeetingList.map((item) => ({
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
    const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const rn = Math.floor(Math.random()*1000)+1;
    XLSX.writeFile(wb, `VirtualMeetingData_${rn}.xlsx`);
    }
     
  };

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

 const handelInfo = (id,EventType=null)=>{
    let data;
    if(meetingType==='physical' || EventType === 'EVTPHYSICAL'){
      data = physicalMeetingList.find((e)=>e.WcCode == id);
    }
    else{
      data = virtualMeetingList.find((e)=>e.WcCode == id);
    }
    if(data){
      setInfoData(data)
      setShowInfoModel(true)
    }
 }

 const handelCloseModel = () => {
  setShowInfoModel(false);
};


 const getClient = async()=>{
      try {
          const res = await axios.get(`${BASEURL}/auth/getClient`);
       
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
        getDepartment(clientToUse);
      }
  },[clientId1,clientId]);

  
  let combinedList = [
    ...virtualMeetingList,...physicalMeetingList
  ]
  console.log(virtualMeetingList,physicalMeetingList)

  return loader ? <Loader/> : (
    <div className="container-fluid">
   
      <div className="d-sm-flex align-items-center justify-content-end mb-4">
        <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
        <div className="input-group mt-2">
            <input
              type="text"
              className="form-control bg-light border-1 small"
              onChange={handleSearchChange}
              value={searchQuery}
              placeholder="Search for..."
              aria-label="Search"
              aria-describedby="basic-addon2"
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm"></i>
              </button>
            </div>
          </div>
        </form>

      
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
        <div className="card-header py-3">
          <button
             onClick={handelReportDownload}
            className="d-sm-inline-block btn btn-sm btn-info shadow-sm"
          >
            <i className="fas fa-download fa-sm text-white-50"></i> Download
            Report
          </button>
        </div>
        <div className="card-body">
        <small className="msgnote mt-2">*Scroll left for other column of table</small>
          <div className="table-responsive">
            <table
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {meetingType ==='physical' ? (physicalMeetingList &&
                  physicalMeetingList.map((e) => {
                    return (
                      <tr key={e.WcCode}>
                        <td>{e.Title}</td>
                        <td>{e.EventStartDateTime}</td>
                        <td>{e.EventEndDateTime}</td>
                        <td>{"Physical"}</td>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        <td>
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
                              </td>
                      </tr>
                    );
                  })) : meetingType ==='virtual' ?(virtualMeetingList &&
                  virtualMeetingList.map((e) => {
                    return (
                      <tr key={e.WcCode}>
                        <td>{e.Title}</td>
                        <td>{e.EventStartDateTime}</td>
                        <td>{e.EventEndDateTime}</td>
                        <td>{"Virtual"}</td>
                        <td>{e.FullName}</td>
                        <td>{e.DeptName}</td>
                        <td>
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
                              </td>
                      </tr>
                    );
                  })):(combinedList &&
                    combinedList.map((e) => {
                      return (
                        <tr key={e.WcCode}>
                          <td>{e.Title}</td>
                          <td>{e.EventStartDateTime}</td>
                          <td>{e.EventEndDateTime}</td>
                          <td>{e.EventType === 'EVTPHYSICAL' ? "Physical" : "Virtual"}</td>
                          <td>{e.FullName}</td>
                          <td>{e.DeptName}</td>
                          <td>
                                <div className="dropdown-container-box">
                                    <button className="gear-button-box">
                                      <i className="fas fa-cog"></i>
                                    </button>
  
                                    <div className="dropdown-menu-box">
                                      
                                      <button className="dropdown-item-box" onClick={()=>handelInfo(e.WcCode,e.EventType)}>
                                        <i className="fas fa-info"></i> Information
                                      </button>
                                     
                                    </div>
                                  </div>
                                </td>
                        </tr>
                      );
                    }))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

       {showInfoModel && (
              <div className="addusermodel">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div
                      className="modal-header show-box"
                      
                    >
                      <h5 className="modal-title">Meeting Info</h5>
                      <button
                        onClick={handelCloseModel}
                        type="button"
                        className="close-but"
                      >
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <form>
                        <div className="form-row">
                          {/* <div className="form-group col-md-6">
                            <label>Meeting Id</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.MeetingId}
                              
                            />
                          </div> */}

                          <div className="form-group col-md-6">
                            <label>Meeting Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.Title}
                              
                            />
                          </div>
                          
                          <div className="form-group col-md-6">
                            <label>Start Date</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.EventStartDateTime}
                              
                            />
                          </div>
                          <div className="form-group col-md-6">
                            <label>End Date</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.EventEndDateTime}
                            
                            />
                          </div>
                         
                          <div className="form-group col-md-6">
                            <label>Client Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.FullName}
                              
                            />
                          </div>

                          <div className="form-group col-md-6">
                            <label>Department Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.DeptName}
                              
                            />
                          </div>
                         
                          <div className="form-group col-md-6">
                            <label>Coordinator Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.Name}
                              
                            />
                          </div>
                          <div className="form-group col-md-6">
                            <label>Coordinator Mobile</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.Mobile}
                              
                            />
                          </div>

                          <div className="form-group col-md-6">
                            <label>Created By</label>
                            <input
                              type="text"
                              className="form-control"
                              value={infoData.displayname}
                              
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}

export default SummaryReport;
