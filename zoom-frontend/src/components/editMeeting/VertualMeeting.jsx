import React, { useContext, useEffect, useState } from 'react'
// import '../../../assets/css/style.css'
// import '../../../assets/css/bootstrap/css/bootstrap.min.css'
// import '../../../assets/icon/themify-icons/themify-icons.css'
// import '../../../assets/icon/font-awesome/css/font-awesome.min.css'
// import '../../../assets/icon/icofont/css/icofont.css'
// import '../../../assets/css/jquery.mCustomScrollbar.css'
import axios from 'axios'

import './PhysicalMeeting.css'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../utils/constant'
import { toast } from 'react-toastify'
import Loader from '../../utils/Loader'
import ConfirmationPopup from '../popup/Popup'
import { LoginContext } from '../../context/LoginContext'
const EditVirtualMeeting = () => {

    const navigate = useNavigate();
    const [loader, setLoader] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(1)

    const [title,setTitle] = useState('');
    const [sdate, setDate] = useState('');
    const [duration,setDuration] = useState('')
    const [cname, setMCoordinatorName] = useState('')
    const [cmobile,setMobileNumber] = useState('')

    const [getSingleMeeting, setGetSingleMeeting] = useState({});
    const [hostId, setHostId] = useState('')
    const [meetingId, setMeetingId] = useState('')
    const [wcid,setWcid]= useState('')
    const [showConfirmation, setShowConfirmation] = useState(false);
   // const {deptId,clientId} = useContext(LoginContext)
   const [deptId,setDeptId] = useState('')
   const [clientId, setClientId] = useState('')

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const {id} = useParams();


    //for speaker
    const [image, setImage] = useState('');
    const [name,setName] = useState('');
    const [qualification, setQualification] = useState('');
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [line3, setLine3] = useState('');

    const [imageName,  setImageName] = useState('')
    const [image1, setImage1] = useState('');
    const [name1,setName1] = useState('');
    const [qualification1, setQualification1] = useState('');
    const [line11, setLine11] = useState('');
    const [line21, setLine21] = useState('');
    const [line31, setLine31] = useState('');
    const [sid, setSid] = useState('')
    
    const [allSpeaker, setSpeaker] = useState([]);
    const [showConfirmation1, setShowConfirmation1] = useState(false);
    const [speakerId, setSpekerId] = useState(null);
    const [speakerImage, setSpeakerImage]= useState("");

    // for configuration

     // for form data

     const [formData, setFormData] = useState([]);
     const [formDataOptinal, setFormDataOptinal] = useState([])
     const [filterData, setFilterData] = useState([])
     const [mandatoryField, setMandatoryField] = useState(null);
     const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
     const [hostUserName, setHostUserName] = useState('');
     const [hostPassword, setHostPassword] = useState('');

     const handleCheckboxChange = (fieldCode,fieldMandatory,fieldName,fisplayOrder) => {
        const updatedSelectedCheckboxes = [...selectedCheckboxes];

        const checkboxIndex = updatedSelectedCheckboxes.findIndex(
          (checkbox) => checkbox.fcode === fieldCode
        );
      
        if (checkboxIndex !== -1) {
          // Remove the checkbox if it's already selected
          updatedSelectedCheckboxes.splice(checkboxIndex, 1);
        } else {
          // Add the checkbox if it's not selected
          updatedSelectedCheckboxes.push({ fcode: fieldCode, fname: fieldName,fman:fieldMandatory, fdis:fisplayOrder });
        }
      
        setSelectedCheckboxes(updatedSelectedCheckboxes);
     };
     
     const fetchFilterData = async ()=>{
        if(mandatoryField.fcode==0){
          return;
        }
       
           const filterdata1 = formData.filter((e)=>{
               return e.FieldCode != mandatoryField.fcode
           });
           
          
           setFilterData(filterdata1)
       
     }

     const handleSelectChange = (e) => {

    
        const selectedIndex = e.target.selectedIndex;
        const selectedOption = e.target.options[selectedIndex];
    
        // Extract the values from the selected option and create an object
        const selectedObject = {
          fcode: +selectedOption.getAttribute('data-fcode'),
          fname: selectedOption.getAttribute('data-fname'),
          fman: selectedOption.getAttribute('data-fman'),
          fdis: +selectedOption.getAttribute('data-fdis'),
        };
          
        console.log("seletedobject",selectedObject)
        setMandatoryField(selectedObject);
      };

     useEffect(()=>{
        fetchFilterData();
     },[mandatoryField])

    // const [hostdata, setHostData] = useState({});
    
    
   

    async function getHostData(){

        try {
            const res = await axios.post(`${API_URL}/form/getHostById`,{fkmid:id});
            console.log("hostdata",res)
            if(res.data.errorCode==="1"){
               const data = res?.data?.data[0];
               setHostUserName(data.username);
               setHostPassword(data.password);
            }
        } catch (error) {
           console.log(error) 
        }
    }

    async function updateHostData(){

        try {
            const res = await axios.post(`${API_URL}/form/updateHostById`,{fkmid:id,hostUserName,hostPassword});
            
            if(res.data.errorCode==="1"){
               //alert("host updated sucsessfully")
            }
        } catch (error) {
           console.log(error) 
        }
    }

    async function UpdateFormField(newArray){
        try {
            const res = await axios.post(`${API_URL}/form/updateFormField`,{data:newArray,fkmid:id,fkwcid:wcid})
            console.log(res)
        } catch (error) {
           console.log(error) 
        }
     }


    const handelConfigurationSubmit = async()=>{
        console.log(hostUserName,hostPassword,id);
         
        console.log("mandatory field",mandatoryField)
        // if(mandatoryField && ){

        //     //selectedCheckboxes.push(mandatoryField);
            
        // }
        setLoader(true)
        if(mandatoryField && mandatoryField.fcode !==0 && selectedCheckboxes.length>0 && selectedCheckboxes[0] !==null){
            console.log("here write logic for add form field")
            const newArray = [...selectedCheckboxes, mandatoryField];
            console.log(newArray)
            await UpdateFormField(newArray);
        }
        console.log(selectedCheckboxes)
        await updateHostData();
        setLoader(false)
        toast.success("Configuration Updated")
        setCurrentIndex(3)
    }
   
    useEffect(()=>{
      getHostData();
    },[])

   // fro poster image 
   //const [clientId,setClientId] = useState(20042);
   //const [depid, setDepId] = useState(34);
   const [posteList, setPosterList] = useState([]);
   const [selectedPoster, setSelectedPoster] = useState('')
   const [posterSelect, setPosterSelect] = useState('')
   const [posterid,setPosterId] = useState(0);

  async function getPoster(){
    const spkCount = allSpeaker.length;
       try {
           const res = await axios.post(`${API_URL}/poster/getPoster`,{deptId,clientId,spkCount});
           if(res.data.errorCode==="1"){

               setPosterList(res.data.data)
           }
       } catch (error) {
          console.log(error) 
       }
   }

   const handelPosterSelect = (postename,posterId)=>{
     

       setPosterSelect(postename)
       setPosterId(posterId)
   }

   async function EditPoster(){

    try {
        const res = await axios.patch(`${API_URL}/poster/updatePosterById/${id}`,{pname:posterSelect,fkpid:posterid,fkwcid:wcid});
        if(res.data.errorCode==="1"){
          // alert("Poster Updated")
           navigate('/dashboard')
        //    alert("poster updated")

        }
    } catch (error) {
       console.log(error) 
    }
}

   useEffect(()=>{
       getPoster();
   },[allSpeaker,clientId])

 
   const handelSubmit = async()=>{
    if(!posterSelect){
        toast.error("Please select poster")
        return;
    }
    if(posterSelect){
        
        await EditPoster();
         navigate('/dashboard')
    }
   }



        // for speaker 

       
        //const [fkmid, setfkmid] = useState('')
    
      
    
        const handelAddSpeaker = async()=>{
    
            if(!image || !name || ! qualification){
                toast.error('Missing required field');
                return;
            }
             setLoader(true)
            const formData = new FormData();
    
            formData.append('image',image);
            formData.append('name',name);
            formData.append('qualification',qualification);
            formData.append('line1',line1);
            formData.append('line2',line2);
            formData.append('line3',line3);
            formData.append('fkmid',id);
            formData.append('fkwcid',wcid);

    
           try {
              const res = await axios.post(`${API_URL}/speaker/addSpeaker`,formData);
              console.log(res)
               if(res.data.errorCode==="1"){
                   getSpeaker();
                   setIsPopUpOpen(false);
               }
           } catch (error) {
            console.log(error)
           }
           setLoader(false)
           setImage("");
           setName("");
           setQualification("");
           setLine1("")
           setLine2("")
           setLine3("") 
            
        }
    
        const handelSpekerDelete = async(id,imgname)=>{
            
            setSpekerId(id);
           setSpeakerImage(imgname);
           setShowConfirmation1(true)
            
        }

        const handleConfirm1 = async()=>{
            setShowConfirmation1(false);
            const id = speakerId;
            try {
                setLoader(true)
                const res = await axios.patch(
                  `${API_URL}/speaker/deleteSpeaker/${id}`,{imgname:speakerImage}
                );
                if(res.data.errorCode=="1"){
                  setLoader(false)
                  //toast.success("Speaker Delete Successfully")
    
                 }
                 getSpeaker();
               
              } catch (error) {
                setLoader(false)
                console.log(error);
              }
    
        }
    
        const handleCancel1 = () => {
            setShowConfirmation1(false);
          };
    
    
        const handelSpeakerUpdate = async(id)=>{
    
            setLoader(true)
            const formData = new FormData();
    
            formData.append('image',image1);
            formData.append('name',name1);
            formData.append('qualification',qualification1);
            formData.append('line1',line11);
            formData.append('line2',line21);
            formData.append('line3',line31);
            formData.append('imgname',imageName);
            try {
                const res  = await  axios.patch(`${API_URL}/speaker/updateSpeaker/${id}`,
                formData
                );
                 
                
               
                 if(res.data.errorCode=="1"){
                     getSpeaker()
                    setIsEditPopUpOpen(false)
                 }
              } catch (error) {
                  console.log(error)
              }

              setLoader(false)
    
        }
       
         
         async function getSpeaker(){
    
            const fkmid = id;
            
            console.log("insdie getspeaker",fkmid)
    
            try {
              const res  = await  axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);
              
              console.log(res, "inside getspeaker")
             
               if(res.data.errorCode=="1"){
                setSpeaker(res.data.data)
               }
            } catch (error) {
                console.log(error)
            }
        }
    
        async function getSpeakerById(id){
    
            try {
                setLoader(true)
              const res  = await  axios.get(`${API_URL}/speaker/getSpeakerById/${id}`);
    
              console.log(res)
      
               if(res.data.errorCode=="1"){
    
                const sdata = res?.data?.data[0]
    
                setImage1("")
                setName1(sdata.SpkName);
                setImageName(sdata.SpkImage)
                setQualification1(sdata.SpkDesignation)
                setLine11(sdata.Bio1)
                setLine21(sdata.Bio2)
                setLine31(sdata.Bio3)
                setSid(sdata.Id)
                setLoader(false)
                //setSingalSpeaker(res.data.data[0])
               }
            } catch (error) {
                setLoader(false)
                console.log(error)
            }
        }
    
    
        useEffect(()=>{
            getSpeaker()
        },[])

        const handelShowPreview = (postername)=>{
            setIsPreviewOpen(true)
            setSelectedPoster(postername)
        }

    const handelSetPopUp = ()=>{
        setIsPopUpOpen(true)
    }

    const handelSetEditPopUp = (id)=>{
        setIsEditPopUpOpen(true)
        getSpeakerById(id)
    }

    const handelClosePopup = ()=>{
        setIsPopUpOpen(false)
    }

    const handelCloseEditPopup = ()=>{
        setIsEditPopUpOpen(false)
    }

    const handelClosePreviewPopup = ()=>{
        setIsPreviewOpen(false)
    }


  
    const handelIndexChange = (value)=>{
        setCurrentIndex(value)
    }
    const handelIndexChange1 = (value)=>{
        if(allSpeaker.length<=0){
            toast.error("Please add speaker");
            return;
        }
        setCurrentIndex(value)
    }

    const handelDataSubmit = async()=>{
         console.log("inside handelData submit",hostId)

         if(duration>45){
    
            toast.warn("Enter duration less than 45 Min");
            return;
           
           }

         await updateMeeting()
        
    }


    useEffect(()=>{
        getMeetingById()
     },[])
        
    
   // popup logic 

   const handleCancel = ()=>{
    setShowConfirmation(false);
}
const handleConfirm = async () => {
      
      setShowConfirmation(false)
     
    try {

            
        const response = await axios.post(`${API_URL}/checkDate`,{meetingDate:sdate}); // You can pass any request data here
        
      
        if(response?.data?.errorCode =='1'){
           setLoader(true)
          //console.log("inside update .....................")
         const  deleteResponce = await axios.post(`${API_URL}/virtualMeet/deleteZoomMeeting`,{meetingId,hostId})

         if(deleteResponce.data.errorCode !== "1"){
            console.log("error in deleting zoom meeting")
         }

    //      console.log("after delete")

           const hostId1 = response?.data?.data[0]?.Account_id
           const accountNum = response?.data?.data[0]?.Account_no
  
          
         // console.log("inside update",hostId, accountNum)
     const res = await axios.post(`${API_URL}/virtualMeet/createZoomMeetAndUpdate`,{topic:title,duration,start_time:sdate,hostId:hostId1,cname,cmobile,id,meetingId})

          if(res.data.errorCode=="1"){
            setLoader(false);
              toast.success(`meeting created in account ${accountNum}`)
              setCurrentIndex(2)
          }
          else{
            console.log("error in creating  zoom meeting in another account")
          }
        }
        else{
          
        
        console.log(response?.data?.message)
        //setLoader(false);
        toast.warn("All account have meeting with provided date please select different date");
      
        }
      } catch (error) {
        setLoader(false);
        console.log(error);
      }
      finally{
        setLoader(false)
      }
  };
    

    const updateMeeting = async()=>{
        //  console.log("updatemeeting",id,hostId)
         
      
        try {
             
            const response = await axios.post(`${API_URL}/checkUpdate/${id}`,{meetingDate:sdate,meetingId,hostId});
            
            //console.log(response);
            if(response.data.errorCode=="1"){
                setLoader(true);
               try {
      
                 const res = await axios.patch(`${API_URL}/virtualMeet/updateVirtualMeeting/${id}`,{title,start_time:sdate,duration,hostId,meetingId,cname,cmobile})
                  // console.log("for meeting update",res)
                  setLoader(false);
                  toast.success('Meeting Updated')
                  setCurrentIndex(2);
               } catch (error) {
                setLoader(false);
                console.log(error)
               }
      
            }
            else{
             
                     setShowConfirmation(true)
           
                    
            }
      
         } catch (error) {
          console.log(error)
         }
      
          
      
       
        }
     async function getMeetingById(){

        setLoader(true)
        try {
            const res = await axios.get(`${API_URL}/virtualMeet/getVirtualMeetingById/${id}`);

            console.log(res,"inside get meeting")
            setGetSingleMeeting(res?.data?.data[0]); 
            const obj = res?.data?.data[0];
            setTitle(obj.Title)
            setDate(obj.EventStartDateTime.substring(0,16));
            setDuration(obj.EventDuration)
            setMobileNumber(obj.Mobile);
            setMCoordinatorName(obj.Name);
            setHostId(obj.AccountId) 
            setMeetingId(obj.MeetingId);
            setWcid(obj.WcId)
            setDeptId(obj.DeptId);
            setClientId(obj.ClientCode)
        } catch (error) {
          console.log(error)  
        }

        setLoader(false)
      }


      // fro from data 

      async function getFormDataMandatory(){
        console.log("clientId", clientId)
        try {
          const res  = await  axios.post(`${API_URL}/form/getFormFieldMandatory`,{clientId});

         
           if(res.data.errorCode=="1"){
            setFormData(res.data.data)
           }
        } catch (error) {
            console.log(error)
        }
    }

    async function getFormDataOptional(){
 
        try {
          const res  = await  axios.post(`${API_URL}/form/getFormFieldOptional`,{clientId});

         
           if(res.data.errorCode=="1"){
            setFormDataOptinal(res.data.data)
           }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        getFormDataMandatory();
        getFormDataOptional()
    },[clientId])
    


  return loader ? <Loader/> : (
    <>
    <div className="pcoded-content">
                            <div className="pcoded-inner-content">
                                <div className="main-body">
                                    <div className="page-wrapper">

                                        <div className="page-body">
                                            <div className="card container">
                                                <div className="card-header">
                                                    <h5>Edit Virtual Meeting</h5>


                                                </div>
                                                <div className="card-block tbstyle tab-icon">
                                                   
                                                    <div className="row ">
                                                        <div className="col-lg-12 col-xl-12">
                                                           
                                                            <div className="sub-title">Fill all details</div>
                                                           
                                                            <ul className="nav nav-tabs md-tabs ">
                                                                <div className="nav-item fw-bolder" onClick={()=>handelIndexChange(1)}>
                                                                    <a className={`nav-link ${currentIndex===1 ?'active':""}`} 
                                                                      ><i
                                                                            className="icofont icofont-meeting-add"></i>Meeting
                                                                        Details</a>
                                                                    <div className="slide"></div>
                                                                </div>
                                                                <div className="nav-item fw-bolder" onClick={()=>handelIndexChange(2)}>
                                                                    <a className={`nav-link ${currentIndex===2 ?'active':""}`} 
                                                                       ><i
                                                                            className="icofont icofont-ui-settings "></i>Configuration</a>
                                                                    <div className="slide"></div>
                                                                </div>
                                                                <div className="nav-item fw-bolder" onClick={()=>handelIndexChange(3)}>
                                                                    <a className={`nav-link ${currentIndex===3 ?'active':""}`}
                                                                       ><i
                                                                            className="icofont icofont-ui-user"></i>Speaker
                                                                        Details</a>
                                                                    <div className="slide"></div>
                                                                </div>
                                                                <li className="nav-item fw-bolder" onClick={()=>handelIndexChange(4)}>
                                                                    <a className={`nav-link ${currentIndex===4 ?'active':""}`}
                                                                        ><i
                                                                            className="icofont icofont-ui-file"></i>Select
                                                                        Template</a>
                                                                    <div className="slide"></div>
                                                                </li>
                                                            </ul>
                                                            
                                                            <div className="tab-content card-block">
                                                                {currentIndex===1 ? (<div className="tab-pane active" id="home7" role="tabpanel">
                                                                    <form action="" className="mx-auto ">
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                Title</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="text" className="form-control"
                                                                                value={title}
                                                                                 onChange={(e)=>{
                                                                                    setTitle(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                Date</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="datetime-local" className="form-control" 
                                                                                value={sdate}
                                                                                onChange={(e)=>{
                                                                                    setDate(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        {/* <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                Starting Time</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="time" className="form-control"/>
                                                                            </div>
                                                                        </div> */}
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                Duration</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="number" className="form-control" 
                                                                                value={duration}
                                                                                placeholder='Enter Duration in Min'onChange={(e)=>{
                                                                                    setDuration(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Coordinator
                                                                                Name</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="text" className="form-control" value={cname} onChange={(e)=>{
                                                                                    setMCoordinatorName(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label ">Coordinator
                                                                                Mobile No.</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="text" className="form-control" value={cmobile} onChange={(e)=>{
                                                                                    setMobileNumber(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        {/* <div className="form-group row container mx-auto">
                                                                            <label className="col-sm-4 col-form-label">Is
                                                                                Webcast Live</label>
                                                                            <div className="col-sm-8">
                                                                                <label>
                                                                                    <input type="radio" name="trueFalse"
                                                                                        value="true"/> True
                                                                                </label>

                                                                                <label>
                                                                                    <input type="radio" name="trueFalse"
                                                                                        value="false"/> False
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label className="col-sm-4 col-form-label">Is
                                                                                Visitor Allowed</label>
                                                                            <div className="col-sm-8">
                                                                                <label>
                                                                                    <input type="radio" name="trueFalse"
                                                                                        value="true"/> True
                                                                                </label>

                                                                                <label>
                                                                                    <input type="radio" name="trueFalse"
                                                                                        value="false"/> False
                                                                                </label>
                                                                            </div>
                                                                        </div> */}
                                                                    </form>
                                                                        <div className="text-right">
                                                                            <button className="btn hor-grd btn-grd-primary "
                                                                            onClick={handelDataSubmit}
                                                                                 >

                                                                                Next</button>
                                                                        </div>

                                                                </div>): currentIndex===2 ? (<div className="tab-pane active">

<form action="" className="mx-auto ">
    

   <div className="form-group row container mx-auto">
      <label className="col-sm-4 col-form-label">Mandatory Field</label>
      <div className="col-sm-8">
        <select
          name="select"
          className="form-control"
           onChange={handleSelectChange}
        >
          <option value="">Select Value</option>
          {formData &&
            formData.map((e) => (
              <option
                key={e.Fid}
                value={e.FieldCode}
                data-fcode={e.FieldCode}
                data-fname={e.FieldName}
                data-fman={e.FieldMandatory}
                data-fdis={e.DisplayOrder}
              >
                {e.FieldName}
              </option>
            ))}
        </select>
      </div>
    </div>
   
    <div className="form-group row container mx-auto">
        <label
            className="col-sm-4 col-form-label">Optional
            Fields</label>
        <div className="col-sm-8">

            {formDataOptinal && formDataOptinal.map((e)=>(

            <label className="labelcs " key={e.Fid}>
                <input type="checkbox"
                    name="checkboxOne"
                     value={e.FieldCode}
                     //checked={selectedCheckboxes.includes(e.FieldCode)}
                     checked={selectedCheckboxes.some((checkbox) => checkbox.fcode === e.FieldCode)}
              onChange={() => handleCheckboxChange(e.FieldCode,e.FieldMandatory,e.FieldName,e.DisplayOrder)}
                     />
                {e.FieldName}
            </label>
            ))}

            {filterData && filterData.map((e)=>(

            <label className="labelcs " key={e.Fid}>
                <input type="checkbox"
                    name="checkboxOne"
                    value={e.FieldCode}
                    checked={selectedCheckboxes.some((checkbox) => checkbox.fcode === e.FieldCode)}
                    //checked={selectedCheckboxes.includes(e.FieldCode)}
            onChange={() => handleCheckboxChange(e.FieldCode,"O",e.FieldName,e.DisplayOrder)}
                    />
                {e.FieldName}
            </label>
            ))}
        </div>
    </div>

    <div className="form-group row container mx-auto">
        <label className="col-sm-4 col-form-label">Host
            Username</label>
        <div className="col-sm-8">
            <input type="text" className="form-control"
            value={hostUserName}
            onChange={(e)=>setHostUserName(e.target.value)}
            />
        </div>
    </div>
    <div className="form-group row container mx-auto">
        <label className="col-sm-4 col-form-label">Host
            Password</label>
        <div className="col-sm-8">
            <input type="text" className="form-control"
            value={hostPassword}
            onChange={(e)=>setHostPassword(e.target.value)}
            />
        </div>
    </div>
    
    <div className="text-right">

    </div>
</form>


<div className="">
        <button className="btn hor-grd btn-grd-primary "
            
            onClick={()=>handelIndexChange(1)}
            >

            Previous</button>
        <button
            className="btn hor-grd btn-grd-primary float-right"
           
            //onClick={()=>{handelIndexChange(3)}}
            onClick={handelConfigurationSubmit}
           >

            Next</button>
    </div>
</div>): currentIndex===3 ? (<div className="tab-pane active" id="messages7" role="tabpanel">
                                                                    <ul className="show-notification"
                                                                        style={{display:'block'}}>
                                                                        <div className="text-center m-3">
                                                                            <button className="btn btn-grd-primary "
                                                                            onClick={handelSetPopUp}
                                                                                data-toggle="modal"
                                                                                data-target="#exampleModalCenter">
                                                                                <i className="icofont icofont-plus"
                                                                                    style={{color:'#fff'}}></i>
                                                                                Add
                                                                                Speaker</button>
                                                                        </div>
                                                                        {allSpeaker && allSpeaker.length>0 && allSpeaker.map((e)=>(
                                                                            <div key={e.Id}>
                                                                            <div className="media">
                                                                                <img className="d-flex align-self-center img-radius"
                                                                                  crossOrigin="anonymous"
                                                                                    src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
                                                                                    alt="Generic placeholder image"
                                                                                    style={{height:'100px',width:'100px'}}/>
                                                                                <div className="media-body ml-5">
                                                                                    <h5 className="notification-user">
                                                                                        {e.SpkName}
                                                                                        </h5>
                                                                                    <p className="notification-msg">
                                                                                    {e.SpkDesignation}
                                                                                    </p>
                                                                                    <span className="notification-time">
                                                                                        <div
                                                                                            className="card-block tbstyle remove-label">
                                                                                            <button onClick={()=>handelSetEditPopUp(e.Id)}
                                                                                                className="btn btn-facebook"
                                                                                               ><i
                                                                                                    className="icofont icofont-edit"></i></button>

                                                                                            <button onClick={()=>handelSpekerDelete(e.Id,e.SpkImage)}
                                                                                                className="btn btn-google-plus ml-2"><i
                                                                                                    className="icofont icofont-trash"></i></button>

                                                                                        </div>
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <hr/>
                                                                        </div>
                                                                          ))}
                                                                        
                                                                    </ul>
                                                                    <div className="">
                                                                        <button className="btn hor-grd btn-grd-primary "
                                                                            
                                                                            onClick={()=>handelIndexChange(2)}
                                                                            >

                                                                            Previous</button>
                                                                        <button
                                                                            className="btn hor-grd btn-grd-primary float-right"
                                                                            
                                                                            onClick={()=>{handelIndexChange1(4)}}
                                                                            >

                                                                            Next</button>
                                                                    </div>
                                                                </div>):currentIndex===4 ? (<div className="tab-pane active" id="settings7" role="tabpanel">
                                                                    <form action="" id="Test &amp; Survey" method="post"
                                                                        className="card tabcontent" style={{display:'block'}}>
                                                                        <div className="row row-cards row-deck">
                                                                        {posteList && posteList.length>0 && posteList.map((e)=>(

                                                                                <div key={e.poster_id} className="col-sm-6 col-xl-4">
                                                                                    <div className="card">
                                                                                        <div className="containerc">
                                                                                            <img 
                                                                                        crossOrigin="anonymous"
                                                                                        src={`${API_URL}/uploads/poster/${e.poster_name}`}
                                                                                                alt="" className="imgposter"/>

                                                                                            <div className="overlay">
                                                                                                <div className="text"><button
                                                                                                        onClick={()=>handelShowPreview(e.poster_name)}
                                                                                                        type="button"
                                                                                                        className="btn btn-danger"
                                                                                                        data-toggle="modal"
                                                                                                        data-target="#exampleModal2"><i
                                                                                                            className="fe fe-file mr-2"></i>Preview
                                                                                                        Invite</button><button
                                                                                                        type="button"
                                                                                                        className="btn btn-danger mt-2"><i
                                                                                                            className="fe fe-code mr-2"></i>Preview
                                                                                                        Website</button>
                                                                                                </div>
                                                                                            </div>

                                                                                        </div>
                                                                                        <button type="button"
                                                                                        onClick={()=>handelPosterSelect(e.poster_name,e.poster_id)}
                                                                                            className="btn btn-primary mx-auto mt-3 mb-3">Select</button>
                                                                                    </div>
                                                                                </div>
                                                                                ))}


                                                                        </div>

                                                                    </form>
                                                                    <div className="">
                                                                        <button className="btn hor-grd btn-grd-primary "
                                                                           
                                                                            onClick={()=>handelIndexChange(2)}
                                                                           >

                                                                            Previous</button>
                                                                        <button
                                                                            className="btn hor-grd btn-grd-primary float-right"
                                                                           
                                                                            onClick={handelSubmit}
                                                                          >

                                                                            Submit</button>
                                                                    </div>

                                                                </div>):("")}
                                                                
                                                                
                                                                
                                                                
                                                            </div>
                                                        </div>

                                                    </div>
                                                    
                                                </div>
                                            </div>
                                        </div>

                                        <div id="styleSelector">

                                        </div>
                                    </div>

                                </div>
                            </div>
                       
                       
                        </div>

                        {showConfirmation1 && (
              <ConfirmationPopup
                message="Are you sure you want to Delete Speaker?"
                onConfirm={() => handleConfirm1()}
                onCancel={handleCancel1}
              />
            )}
            
                        {isPopUpOpen && (
             <div className="addspeaker" id="exampleModalCenter" tabIndex="-1" role="dialog"
                aria-labelledby="exampleModalCenterTitle" aria-hidden="true" onClick={()=>setIsPopUpOpen(false)}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content" onClick={e => {
          // do not close modal if anything inside modal content is clicked
          e.stopPropagation();
        }}>
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Add Speaker</h5>
                            <button type="button" onClick={handelClosePopup} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                            <div className="text-center mx-auto mb-2">
                            <img
                              src={image? URL.createObjectURL(image) :"/images/userimg.png"}
                              alt="Speaker image"
                              className="avatar1"
                            />
                            <label htmlFor="upload-input">
                              <div className="icon-container">
                                <i className="fas fa-pen"></i>
                              </div>
                            </label>
                            
                            <p>Speaker Photo</p>
                            <input
                              id="upload-input"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                               
                                setImage(
                                  (e.target.files[0])
                                );
                              }}
                            />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Name</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" className="form-control" name="example-text-input"
                                            placeholder="Name"
                                            onChange={(e)=>{
                                                setName(e.target.value)  
                                              }}/>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Qualification</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" className="form-control" name="example-text-input"
                                            placeholder="Qualification"
                                            onChange={(e)=>{
                                                setQualification(e.target.value)  
                                              }}/>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Bios Line 1</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" className="form-control" name="example-text-input"
                                            placeholder=".........."
                                            onChange={(e)=>{
                                                setLine1(e.target.value)  
                                              }}/>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Bios Line 2</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" className="form-control" name="example-text-input"
                                            placeholder=".........."
                                            onChange={(e)=>{
                                                setLine2(e.target.value)  
                                              }}/>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Bios Line 3</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" className="form-control" name="example-text-input"
                                            placeholder=".........."
                                            onChange={(e)=>{
                                                setLine3(e.target.value)  
                                              }}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">

                            <button type="button" className="btn btn-primary"
                            onClick={handelAddSpeaker}
                            >Submit</button>
                        </div>
                    </div>
                </div>
            </div>)}

            {isEditPopUpOpen && (
            <div className="addspeaker" id="editspeak" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle">Edit Speaker</h5>
                            <button type="button" onClick={handelCloseEditPopup} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                            <div className="text-center mx-auto mb-2">
                            <img
                              src={image1 ? URL.createObjectURL(image1) : `${API_URL}/uploads/speaker/${imageName}`}
                              alt="Speaker image"
                              className="avatar1"
                              crossOrigin="anonymous"
                            />
                            <label htmlFor="upload-input">
                              <div className="icon-container">
                                <i className="fas fa-pen"></i>
                              </div>
                            </label>
                            
                            <p>Speaker Photo</p>
                            <input
                              id="upload-input"
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                               
                                setImage1(
                                e.target.files[0]
                                );
                              }}
                            />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Name</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" value={name1} className="form-control" name="example-text-input"
                                            placeholder="Name"
                                            onChange={(e)=>{
                                               setName1(e.target.value)
                                            }}
                                            />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Qualification</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" value={qualification1} className="form-control"
                                            name="example-text-input" placeholder="Qualification"
                                            onChange={(e)=>{
                                                setQualification1(e.target.value)
                                             }}
                                            />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Bios Line 1</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" value={line11} className="form-control" name="example-text-input"
                                            placeholder=".........."
                                            onChange={(e)=>{
                                                setLine11(e.target.value)
                                             }}
                                            />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Bios Line 2</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" value={line21} className="form-control" name="example-text-input"
                                            placeholder=".........."
                                            onChange={(e)=>{
                                                setLine21(e.target.value)
                                             }}
                                            />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 col-lg-4">
                                    <label className="form-label">Speaker Bios Line 3</label>
                                </div>
                                <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="text" value={line31} className="form-control" name="example-text-input"
                                            placeholder=".........."
                                            onChange={(e)=>{
                                                setLine31(e.target.value)
                                             }}
                                            />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">

                            <button type="button" className="btn btn-primary"
                              onClick={()=>handelSpeakerUpdate(sid)}
                            >Submit</button>
                        </div>
                    </div>
                </div>
            </div>)}
            
            {isPreviewOpen && (<div className="addspeaker" id="exampleModal2" tabIndex="-1" role="dialog"
                aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLongTitle"></h5>
                            <button type="button" onClick={handelClosePreviewPopup} className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <img 
                            crossOrigin="anonymous"
                            src={`${API_URL}/uploads/poster/${selectedPoster}`}
                            alt='PosterImage'
                            style={{width:'100%'}}/>
                        </div>

                    </div>
                </div>
            </div>)}

            {showConfirmation && (
              <ConfirmationPopup
                message="Zoom meeting already exist Want to
                create Meeting in new account if Yes then meeting url must be change?"
                onConfirm={() => handleConfirm()}
                onCancel={handleCancel}
              />
            )}

    </>
  )
}

export default EditVirtualMeeting