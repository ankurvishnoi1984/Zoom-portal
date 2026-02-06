
import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import "./report.css"
import Loader1 from "../utils/Loader1";
import FileSaver from "file-saver";
import JSZip from "jszip";
import toast from "react-hot-toast";
const Report = () => {

    const [reportData,SetReportData] = useState([]);
    const [downloadreport,setDownloadReport]= useState([])
    const [subCatData, SetSubCatData]= useState([]);
    const [topLineData, SetTopLineData]= useState([]);
    const [repo, setRepo] = useState("");
  
    console.log("dowanload report",reportData)
    const [topLine,SetTopLine] = useState("")
    const [fifthline,SetFifthLine] = useState([])
    const [fourthLine,SetFourthLine] = useState("")
    const [getFourthline,SetgetFourthline] = useState([])
    const [thirdLine,SetThirdLine] = useState("")
    const [getThirdline,SetgetThirdline] = useState([])
    const [secondLine,SetSecondLine] = useState("")
    const [getSecondline,SetgetSecondline] = useState([])

    const [firstLine,SetFirstLine] = useState("")
    const [getFirstline,SetgetFirstline] = useState([])

    const [zeroLine,SetZeroLine] = useState("")
    const [getZeroline,SetgetZeroline] = useState([])
    const [searchQuery, setSearchQuery] = useState('');
    //console.log('outsied',getFourthline)

    const [subCatId, setSubCatId] = useState("");
    const [rqid1 , setRqid1] = useState("");
    const [rqid2, setRqid2] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagelength,setPageLength] = useState(0)

    const [filter,setFilter] = useState("");
    const [sDate,setSDate]= useState("");
    const [eDate,setEDate] = useState("");

    const [fromTop, setFromTop]= useState([])
    
    //console.log("subcat",subCatId,"st",sDate,"ed",eDate);

   
    const [loading,setLoading] = useState(false);
    const [zone, setZone] = useState([]);
    const [zoneId, setZoneId] = useState(0)

    //console.log(sDate,eDate)

    async function GetZone(){
      try {
          const res = await axios.get(`${BASEURL}/basic/getZone`);
          console.log("inside get zone",res);
          setZone(res.data);
      } catch (error) {
         console.log(error)
      }
  }

    const handelNext = () => {
        if (currentPage * entriesPerPage < pagelength) {
          setCurrentPage((prev) => prev + 1);
        }
      };
      const handelPrevious = () => {
        if (currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      };
     
      const handleSearchChange = event => {
        setSearchQuery(event.target.value);
        setCurrentPage(1)
      };
      
  const entriesPerPage = 20;
  const startingEntry = (currentPage - 1) * entriesPerPage + 1;
  //const endingEntry = 20;
  //console.log("emplength",emplength)
  //const endingEntry = Math.min(startingEntry + entriesPerPage - 1, emplength);
  const endingEntry = Math.min(startingEntry + entriesPerPage - 1, pagelength);

    useEffect(()=>{
        //GetReportData();
        GetSubCatInfo();
        GetTopLine();
        GetZone();
    },[])
    useEffect(()=>{
        GetReportData();
        // GetDownloadReportData();
    },[repo,subCatId,currentPage,searchQuery,filter])

    useEffect(()=>{
      // GetReportData();
      
      GetDownloadReportData();
  },[repo,subCatId,filter])


  useEffect(()=>{
    // GetReportData();
    getRepotFromTop()
  
},[repo,subCatId,zoneId])
 


  // for zip download 
  //console.log("date...............",sDate,eDate)
  const handelSearchDate = ()=>{
    if(!filter && sDate && eDate){
      GetDownloadReportData();
      GetReportData();
      getRepotFromTop();
      
    }else if(filter){
      alert("Please Unselect Filter Month/Week Wise")
    }
    else{
      alert("Please Select Date")
    }
  }

  const handelDownloadZip = async (userId)=>{
    const toastId = toast.loading("Processing your download...");
    const imagData = await getDownloadImageData(userId)
     //console.log(imagData)
    //console.log("runiing")

    const zip = new JSZip();

    // Loop through the employee data
    for (const employee of imagData) {
      const { report_id,report_type,camp_date, images } = employee;

      const employeeFolder = zip.folder(`${report_type}_${report_id}_${camp_date}`);

      // Add doctor posters to the employee folder
      for (let i = 0; i < images.length; i++) {
        try {
          const response = await fetch(`${BASEURL}/uploads/report/${images[i].imgpath}`);
          const blob = await response.blob();
          employeeFolder.file(`image_${i + 1}.jpg`, blob, { binary: true });
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    }

    // Generate the zip file
    zip.generateAsync({ type: "blob" }).then((content) => {
      // Save the zip file
      FileSaver.saveAs(content, "optitrack_camp_images.zip");
    });
    toast.success("Download complete!", { id: toastId });
  }

  async function getDownloadImageData(userId){
    try {
       
      const res = await axios.get(`${BASEURL}/admin/imageDownload/${userId}`);
      console.log("image data",res.data);
      return res.data;
    } catch (error) {
     console.log(error)
    }
  }

  // for FromTopLine 
  async function getRepotFromTop(){
    try {
      let res
      if(repo && !subCatId){
        res = await axios.post(`${BASEURL}/admin/getReportFromTop?empcode=${repo}&startDate=${sDate}&endDate=${eDate}&subCatId=${0}&zoneId=${zoneId}`)

      }else if(repo){

        res = await axios.post(`${BASEURL}/admin/getReportFromTop?empcode=${repo}&startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}&zoneId=${zoneId}`)
      }
      else{
        setFromTop('')
        return;
      }

      setFromTop(res.data[0])
    } catch (error) {
      console.log(error)
    }
  }

    async function GetReportData(){
        try {
            
            let res;
             if(filter && subCatId){
                //console.log("hellow........")
             res = await axios.get(`${BASEURL}/admin/getReport?&filter=${filter}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);

            }
            else if(sDate && eDate && subCatId){
                //console.log("hellow........")
             res = await axios.get(`${BASEURL}/admin/getReport?startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);

            }
            else if(sDate && eDate){
                //console.log("hellow........")
             res = await axios.get(`${BASEURL}/admin/getReport?startDate=${sDate}&endDate=${eDate}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);

            }
             else if(subCatId){

             res = await axios.get(`${BASEURL}/admin/getReportNormal?subCatId=${subCatId}&rqId1=${rqid1}&rqId2=${rqid2}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);
            }
            else if(filter){
                res = await axios.get(`${BASEURL}/admin/getReport?&filter=${filter}&empcode=${repo}&searchName=${searchQuery}&page=${currentPage}&limit=20`);
   
               }
            else{
              console.log("iside this getreport normal");
               res = await axios.get(`${BASEURL}/admin/getReportNormal?empcode=${repo}&page=${currentPage}&limit=20&searchName=${searchQuery}`);
              
            }

            console.log("inside get normal report",res)
            SetReportData(res.data.reportData)
            setPageLength(res.data.totalRowCount)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetDownloadReportData(){
        try {
            setLoading(true)
            let res;
             if(filter && subCatId){
                //console.log("hellow........")
             res = await axios.get(`${BASEURL}/admin/downloadReportFilter?&filter=${filter}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}`);

            }
            else if(sDate && eDate && subCatId){
                //console.log("hellow........")
             res = await axios.get(`${BASEURL}/admin/downloadReportFilter?startDate=${sDate}&endDate=${eDate}&subCatId=${subCatId}&empcode=${repo}&searchName=${searchQuery}`);

            }
            else if(sDate && eDate){
                //console.log("hellow........")
             res = await axios.get(`${BASEURL}/admin/downloadReportFilter?startDate=${sDate}&endDate=${eDate}&empcode=${repo}&searchName=${searchQuery}`);

            }
             else if(subCatId){

             res = await axios.get(`${BASEURL}/admin/downloadReport?subCatId=${subCatId}&rqId1=${rqid1}&rqId2=${rqid2}&empcode=${repo}&searchName=${searchQuery}`);
            }
            else if(filter){
                res = await axios.get(`${BASEURL}/admin/downloadReportFilter?&filter=${filter}&empcode=${repo}&searchName=${searchQuery}`);
   
               }
            else{

               res = await axios.get(`${BASEURL}/admin/downloadReport?empcode=${repo}&searchName=${searchQuery}`);
            }
            if(res.status===200){
              setLoading(false)
              setDownloadReport(res.data)
            }
            else{
              setLoading(false)
              alert("error in report data fetching please try again")
            }
          
        } catch (error) {
           console.log(error) 
           setLoading(false)
           alert("error in report data fetching please try again")
        }
    }

   
    // async function GetReportDataForCat(subCatId,rqid1,rqid2){
    //     try {
    //         //const res = await axios.get(`${BASEURL}/admin/getReport?subCatId=${subCatId}&rqId1=${rqid1}&rqId2=${rqid2}`);
    //         //console.log(res)
    //         SetReportData(res.data)
    //     } catch (error) {
    //        console.log(error) 
    //     }
    // }

    async function GetSubCatInfo(){
        try {
            const res = await axios.get(`${BASEURL}/admin/subCatInfo`);
            SetSubCatData(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetTopLine(){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode:0});
            //console.log("topline",res.data)
            SetTopLineData(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetFifthLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("fifthline",res.data)
            SetFifthLine(res.data)
        } catch (error) {
           console.log(error) 
        }
    }
    async function GetFourthLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("fifthline",res.data)
            SetgetFourthline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetThirdLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("thirdline",res.data)
            SetgetThirdline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetSecondLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("second linnnnnnnnnnnnnnnnnnnn",res.data)
            SetgetSecondline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetFirstLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("firest linnnnnnnnnnnnnnnnnnnn",res.data)
            SetgetFirstline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetZeroLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("zero linnnnnnnnnnnnnnnnnnnn",res.data)
            SetgetZeroline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }

    async function GetBottomLine(empcode){
        try {
            const res = await axios.post(`${BASEURL}/admin/getEmp`,{empcode});
            //console.log("bottom linnnnnnnnnnnnnnnnnnnn",res.data)
            //SetgetZeroline(res.data)
        } catch (error) {
           console.log(error) 
        }
    }
    
    const handelReportDownload = ()=>{
        // Define custom column headers
        const headers = [
            'Employee Code',
            'Employee Name',
            'Total Camps',
            'Total Doctor',
            'Patient Screened',
            'Patient Diagnosed',
            'Rx Generated Count',
            'Role'
          ];

          
      
          // Map the data to match the custom column headers
          const mappedData = downloadreport.map(item => ({
            'Employee Code': item.emp_code,
            'Employee Name': item.emp_name,
            'Total Camps': item.camp_count,
            'Total Doctor': item.doctor_count,
            'Patient Screened': item.screened_count,
            'Patient Diagnosed': item.diagnosed_count,
            'Rx Generated Count':item.prescription_count,
            'Role':item.role
          }));
      
          const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, 'Optitrack_CampReportData.xlsx');
        
       }

       const handelReportDownloadFromTop = ()=>{
        // Define custom column headers
        
        const headers = [
            'Employee Code',
            'Employee Name',
            'Total Camps',
            'Total Doctor',
            'Patient Screened',
            'Patient Diagnosed',
            'Rx Generated Count',
            
          ];

          
      
          // Map the data to match the custom column headers
          const mappedData = fromTop.map(item => ({
            'Employee Code': item.empcode,
            'Employee Name': item.name,
            'Total Camps': item.TotalCampCount,
            'Total Doctor': item.TotalDoctorCount,
            'Patient Screened': item.TotalPatientScaneed,
            'Patient Diagnosed': item.TotalPatientDiagnosed,
            'Rx Generated Count':item.TotalPrescribe,
            
          }));
      
          const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, 'Optitrack_CampAllData.xlsx');
        
       }




      
  
       const handelSingalReportDownload = (id)=>{
        // Define custom column headers
        //console.log("inside reportdata",reportData)
        const filterData = reportData.filter((e)=>{
            return e.emp_id===id
          })
        const headers = [
            'Employee Code',
            'Employee Name',
            'Total Camps',
            'Total Doctor',
            'Patient Screened',
            'Patient Diagnosed',
            'Rx Generated Count'
          ];

          
           //console.log("filterdata",filterData)
          // Map the data to match the custom column headers
          const mappedData = filterData.map(item => ({
            'Employee Code': item.emp_code,
            'Employee Name': item.emp_name,
            'Total Camps': item.camp_count,
            'Total Doctor': item.doctor_count,
            'Patient Screened': item.screened_count,
            'Patient Diagnosed': item.diagnosed_count,
            'Rx Generated Count':item.prescription_count
          }));
          
          //console.log(mappedData);
          const ws = XLSX.utils.json_to_sheet(mappedData, { header: headers });
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'employee');
          XLSX.writeFile(wb, 'Optitrack_SingalEmpReport.xlsx');
        
       }  
    

  //  function handleCatData(event) {
  //   const selectedOption = event.target;
  //   const selectedValues = selectedOption.value.split(',');
  
  //   // The first value is subcat_id, the second is rqid1, and the third is rqid2
  //   const selectedSubcatId = selectedValues[0];
  //   const rqid1 = selectedValues[1];
  //   const rqid2 = selectedValues[2];
    
  //   //console.log(typeof(rqid1))
  //   // Handle the values here
  //   //console.log('Selected Subcat ID:', selectedSubcatId);
  //   //console.log('rqid1:', rqid1);
  //   //console.log('rqid2:', rqid2);
  //   if(selectedSubcatId=='null' || rqid1 === undefined  || rqid2=== undefined){
  //       //console.log("inside main")
  //       setSubCatId("");
  //       setRqid1("");
  //       setRqid2("");
  //       //GetReportData();
  //       return;
  //   }
  //   setSubCatId(selectedSubcatId);
  //   setRqid1(rqid1);
  //   setRqid2(rqid2);
  //   //GetReportDataForCat(selectedSubcatId,rqid1,rqid2)   
  //   }


   //console.log("selected subcat",subCatId)
   
  return loading ? <Loader1/> :  (
    <div className="container-fluid">
    {/* Content Row */}
       
    <div className="d-sm-flex align-items-start justify-content-end mb-4">
        {/* Dropdown for Select Camp */}
        
        

      <select name="topline"
       id="topline"
       className="form-control selectStyle ml-2 mb-2"
       onChange={(e)=>{
        //console.log("inside 111",e.target.value)
        SetTopLine(e.target.value)
        //console.log("iside onchange",topLine)
        setRepo(e.target.value)
        setCurrentPage(1)
        if(e.target.value){

            GetFifthLine(e.target.value)
        }
       }}
       value={topLine}
      >
        <option value="">Select Top Line</option>   
         {topLineData && topLineData.map((e) => (
        <option
            key={e.user_id}
            value={e.empcode}
        >
            {e.name}
        </option>
        ))}
      </select>

            

      <select
                  name=""
                  id=""
                  className="form-control selectStyle ml-2 mb-2"
                  onChange={(e) => {
                    SetFourthLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetFourthLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(topLine)
                    }
                  }}
                 value={fourthLine}
                >
                  {topLine === "" ? (
                    <option value="">Reporting1</option>
                  ) : (
                    <>
                      <option value="">Reporting1</option>

                      {fifthline &&
                        fifthline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
      </select>

                <select
                  name=""
                  id=""
                  className="form-control selectStyle ml-2 mb-2"
                  onChange={(e) => {
                    SetThirdLine(e.target.value);
                    setCurrentPage(1)
                    if(e.target.value){
                        GetThirdLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(fourthLine)
                    }
                  }}
                 value={thirdLine}
                >
                  {topLine === "" || fourthLine === "" ? (
                    <option value="">Reporting2</option>
                  ) : (
                    <>
                      <option value="">Reporting2</option>
                      {getFourthline &&
                        getFourthline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2 mb-2"
                 onChange={(e) => {
                    SetSecondLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetSecondLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(thirdLine)
                    }
                  }}
                  value={secondLine}
                  >
                  {topLine === "" || fourthLine === "" || thirdLine === "" ? (
                    <option value="">Reporting3</option>
                  ) : (
                    <>
                      <option value="">Reporting3</option>
                      {getThirdline &&
                        getThirdline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2 mb-2"
                 onChange={(e) => {
                    SetFirstLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetFirstLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(secondLine)
                    }
                  }}
                  value={firstLine}
                  >
                  {topLine === "" || fourthLine === "" || thirdLine === "" || secondLine=="" ? (
                    <option value="">Reporting4</option>
                  ) : (
                    <>
                      <option value="">Reporting4</option>
                      {getSecondline &&
                        getSecondline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2 mb-2"
                 onChange={(e) => {
                    SetZeroLine(e.target.value)
                    setCurrentPage(1)
                    if(e.target.value){
                        GetZeroLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(firstLine)
                    }
                  }}
                  value={zeroLine}
                  >
                  {topLine === "" || fourthLine === "" || thirdLine === "" || secondLine=="" || firstLine=="" ? (
                    <option value="">Reporting5</option>
                  ) : (
                    <>
                      <option value="">Reporting5</option>
                      {getFirstline &&
                        getFirstline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

                <select 
                name=""
                 id=""
                 className="form-control selectStyle ml-2"
                 onChange={(e) => {
                   
                    if(e.target.value){
                        GetBottomLine(e.target.value)
                        setRepo(e.target.value)
                    }
                    else{
                        setRepo(zeroLine)
                    }
                  }}
                  >
                  {topLine === "" || fourthLine === "" || thirdLine === "" || secondLine=="" || firstLine=="" || zeroLine=="" ? (
                    <option value="">Reporting6</option>
                  ) : (
                    <>
                      <option value="">Reporting6</option>
                      {getZeroline &&
                        getZeroline.map((e) => (
                          <option key={e.user_id} value={e.empcode}>
                            {e.name}
                          </option>
                        ))}
                    </>
                  )}
                </select>

        {/* Dropdowns for Select Top Line, Select State Head, Select FLM, and Select MR */}
        {/* You can reuse this structure for each dropdown */}
       

       
        {/* Search Bar */}
    </div>
    <div className="d-sm-flex align-items-start justify-content-end mb-4">

    <div className="dropdown ml-3">
          {/* Dropdown items go here */}
          <select
            className="form-control selectStyle selecCamp"
            onChange={(e)=>{
             setZoneId(e.target.value)
            }}
            value={zoneId}
          >
            <option value="0">All Zone</option>
            {zone && zone.length>0 && zone.map((e)=>(
              <option key={e.zone_id} value={e.zone_id}>{e.zone_name}</option>
            ))}
          </select>
        </div>
    <div className="dropdown ml-2">
    <select className="form-control selectStyle selecCamp" name="cat" id="cat" 
    value={subCatId} onChange={(e)=>{
      setSubCatId(e.target.value)
    }}>
        <option value="0">All Camp</option>   
         {/* {subCatData && subCatData.map((e) => (
        <option
            key={e.subcat_id}
            value={`${e.subcat_id},${e.rqid1},${e.rqid2}`}
        >
            {e.subcategory_name} Camp
        </option>
        ))} */}
        <option value="1">Dry-Eye Screening</option>
        <option value="2">Glaucoma Screening</option>
        <option value="3">Post-operative Entry</option>
      </select>
        </div>


    <div className="dropdown ml-2">
                                
                               
                                    {/* Dropdown items go here */}
                                    <select className="form-control selectStyle" style={{marginTop:"32px"}} value={filter} name="filter" id="filter" onChange={(e)=>{
                                        setFilter(e.target.value)
                                    }}>
                                         <option value="">Select Filter</option>
                                         <option value="monthly">Month Wise</option>   
                                         <option value="weekly">Week Wise</option>   
                                    </select>
                                    
                                
  </div>
         <div className="form-group ml-2">
            <label htmlFor="fromDate">From Date:</label>
            <input type="date" className="form-control" id="fromDate" placeholder="Select From Date" value={sDate} onChange={(e)=>setSDate(e.target.value)}/>
        </div>

        {/* Datepicker for "To" date */}
        <div className="form-group ml-2">
            <label htmlFor="toDate">To Date:</label>
            <input type="date" className="form-control" id="toDate" placeholder="Select To Date" value={eDate} onChange={(e)=>setEDate(e.target.value)}/>
        </div>

        <button className="btn btn-primary btn-icon-split" style={{marginTop:"30px", marginLeft:"5px"}} onClick={handelSearchDate}>
                                <span className="text">Search</span>
                                <span className="icon text-white-60">
                                    <i className="fas fa-search fa-sm"></i>
                                </span>
                            </button>

    </div>
    <div className="form-group ml-2 reposerch">
    <div className="input-group">
                                    <input type="text" className="form-control bg-light border-1 small" value={searchQuery}
                  onChange={handleSearchChange} placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2" />
                                    <div className="input-group-append">
                                        <button className="btn btn-primary" type="button">
                                            <i className="fas fa-search fa-sm"></i>
                                        </button>
                                    </div>
                                </div>
        </div>
        

    {/* Content Row */}
    <div className="card shadow mb-4">
        <div className="card-header py-3">
            <button onClick={handelReportDownload} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm">
                <i className="fas fa-download fa-sm text-white-50"></i> Download Report</button>

                <button onClick={handelReportDownloadFromTop} className="d-none d-sm-inline-block btn btn-sm btn-info shadow-sm ml-2">
                <i className="fas fa-download fa-sm text-white-50"></i> Download Count Wise</button>

               
        </div>
        
        <div className="card-body">
            {/* <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Details</th>
                            <th>Total Camps</th>
                            <th>Total Doctors</th>
                            <th>Patients Screened</th>
                            <th>Patients Diagnosed</th>
                            <th>Prescription Generated</th>
                            <th>Download Report</th>
                            <th>Download Zip</th>
                        </tr>
                    </thead>

                    <tbody>
                        
                        {reportData && reportData.map((e)=>{
                            return(
                           <tr key={e.emp_id}>
                            <td>{e.emp_name}</td>
                            <td>{e.camp_count}</td>
                            <td>{e.doctor_count}</td>
                            <td>{e.screened_count}</td>
                            <td>{e.diagnosed_count}</td>
                            <td>{e.prescription_count}</td>

                            <td><button onClick ={()=>handelSingalReportDownload(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                            <td><button onClick ={()=>handelDownloadZip(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                        </tr>
                            )
                        })}
                        
                     
                    </tbody>
                </table>
                <div
                   className="textdiv"
                  >
                    <div>
                      {" "}
                      Showing {startingEntry} to {endingEntry} of {reportData && pagelength}{" "}
                      entries
                    </div>
                    <div className="resdiv">
                      <button className="btn btn-light pag-but" onClick={handelPrevious}>
                        Previous
                      </button>
                      <button className="btn btn-light pag-but pag-but-bg">
                        {currentPage}
                      </button>
                      <button className="btn btn-light pag-but" onClick={handelNext}>
                        Next
                      </button>
                    </div>
                  </div>
            </div> */}

            {fromTop && fromTop.length>0 ?( <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Details</th>
                            <th>Total Camps</th>
                            <th>Total Doctors</th>
                            <th>Patients Screened</th>
                            <th>Patients Diagnosed</th>
                            <th>Rx Generated</th>
                            
                            
                        </tr>
                    </thead>

                    <tbody>
                        {/* Repeat this row structure for each table row */}
                        {fromTop && fromTop.map((e)=>{
                            return(
                           <tr key={e.empcode}>
                            <td>{e.name}</td>
                            <td>{e.TotalCampCount}</td>
                            <td>{e.TotalDoctorCount}</td>
                            <td>{e.TotalPatientScaneed}</td>
                            <td>{e.TotalPatientDiagnosed}</td>
                            <td>{e.TotalPrescribe}</td>

                            {/* <td><button onClick ={()=>handelSingalReportDownload(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td> */}
                            {/* <td><button onClick ={()=>handelDownloadZip(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td> */}
                        </tr>
                            )
                        })}
                        
                        {/* Repeat this row structure for each table row */}
                    </tbody>
                </table>
                
            </div>):(<div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Employee Details</th>
                            <th>Total Camps</th>
                            <th>Total Doctors</th>
                            <th>Patients Screened</th>
                            <th>Patients Diagnosed</th>
                            <th>Rx Generated</th>
                            <th>Download Report</th>
                            <th>Download Images</th>
                        </tr>
                    </thead>

                    <tbody>
                        
                        {reportData && reportData.map((e)=>{
                            return(
                           <tr key={e.emp_id}>
                            <td>{e.emp_name}</td>
                            <td>{e.camp_count}</td>
                            <td>{e.doctor_count}</td>
                            <td>{e.screened_count}</td>
                            <td>{e.diagnosed_count}</td>
                            <td>{e.prescription_count}</td>

                            <td><button onClick ={()=>handelSingalReportDownload(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                            <td><button onClick ={()=>handelDownloadZip(e.emp_id)} style={{border:"none"}} className="btn-sm btn-primary btn-circle"><i className="fas fa-download"></i></button></td>
                        </tr>
                            )
                        })}
                        
                     
                    </tbody>
                </table>
                <div
                   className="textdiv"
                  >
                    <div>
                      {" "}
                      Showing {startingEntry} to {endingEntry} of {reportData && pagelength}{" "}
                      entries
                    </div>
                    <div className="resdiv">
                      <button className="btn btn-light pag-but" onClick={handelPrevious}>
                        Previous
                      </button>
                      <button className="btn btn-light pag-but pag-but-bg">
                        {currentPage}
                      </button>
                      <button className="btn btn-light pag-but" onClick={handelNext}>
                        Next
                      </button>
                    </div>
                  </div>
            </div>)}
        </div>
    </div>
</div>
  )
}

export default Report