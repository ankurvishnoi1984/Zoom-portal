import React, { useContext, useEffect, useState } from 'react'
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
                                            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm !border !border-gray-200">
  <div className="px-8 py-6 border-b border-gray-100">
    <h2 className="text-xl font-semibold text-gray-800">
      Edit Virtual Meeting
    </h2>
    <p className="text-sm text-gray-500 mt-1">
      Update meeting details
    </p>
  </div>

  <div className="p-4">
                                              
                                                   
                                                    <div className="row ">
                                                        <div className="col-lg-12 col-xl-12">
                                                       
                                                           
                                                          <div className="flex flex-wrap gap-2 mb-8">
  {[
    { id: 1, label: "Meeting Details" },
    { id: 2, label: "Configuration" },
    { id: 3, label: "Speaker Details" },
    { id: 4, label: "Select Template" },
  ].map((tab) => (
    <button
      key={tab.id}
      onClick={() => handelIndexChange(tab.id)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition
        ${
          currentIndex === tab.id
            ? "bg-blue-600 text-white shadow"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
    >
      {tab.label}
    </button>
  ))}
</div>
                                                            
                                                            <div className="tab-content card-block">
                                                                {currentIndex===1 ? 
                                                                (
                                                                <div className="grid grid-cols-2 md:grid-cols-2 gap-6">

  {/* Title */}
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Meeting Title
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter meeting title"
    />
  </div>

  {/* Date */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Meeting Date
    </label>
    <input
      type="datetime-local"
      value={sdate}
      onChange={(e) => setDate(e.target.value)}
      className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Duration */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Duration (minutes)
    </label>
    <input
      type="number"
      value={duration}
      onChange={(e) => setDuration(e.target.value)}
      className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Coordinator */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Coordinator Name
    </label>
    <input
      type="text"
      value={cname}
      onChange={(e) => setMCoordinatorName(e.target.value)}
      className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  {/* Mobile */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Coordinator Mobile
    </label>
    <input
      type="number"
      value={cmobile}
      onChange={(e) => setMobileNumber(e.target.value)}
      className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div className="flex justify-end mt-8 md:col-span-2">
    <button
      onClick={handelDataSubmit}
      className="px-6 h-11 rounded-lg bg-blue-600 text-white font-semibold
                 shadow-sm hover:bg-blue-700 transition"
    >
      Next →
    </button>
  </div>
</div>
                                                                ): currentIndex===2 ? 
                                                                (
                                                       <div className="space-y-6">

  {/* Mandatory Field */}
  <div className="grid md:grid-cols-3 gap-4 items-start">
    <label className="text-sm font-semibold text-gray-700 md:pt-3">
      Mandatory Field
    </label>

    <div className="md:col-span-2">
      <select
        name="select"
        onChange={handleSelectChange}
        className="w-full h-11 rounded-xl !border !border-blue-200 px-4 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   bg-white"
      >
        <option value="">Select Value</option>
        {formData?.map((e) => (
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

  {/* Optional Fields */}
  <div className="grid md:grid-cols-3 gap-4 items-start">
    <label className="text-sm font-semibold text-gray-700 md:pt-2">
      Optional Fields
    </label>

    <div className="md:col-span-2">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Optional list */}
        {formDataOptinal?.map((e) => (
          <label
            key={e.Fid}
            className="flex items-center gap-2 p-2 rounded-lg
                       hover:bg-blue-50 cursor-pointer !border !border-gray-100"
          >
            <input
              type="checkbox"
              value={e.FieldCode}
              checked={selectedCheckboxes.some(
                (checkbox) => checkbox.fcode === e.FieldCode
              )}
              onChange={() =>
                handleCheckboxChange(
                  e.FieldCode,
                  e.FieldMandatory,
                  e.FieldName,
                  e.DisplayOrder
                )
              }
              className="h-4 w-4 text-blue-600 rounded
                         focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">
              {e.FieldName}
            </span>
          </label>
        ))}

        {/* Filtered list */}
        {filterData?.map((e) => (
          <label
            key={e.Fid}
            className="flex items-center gap-2 p-2 rounded-lg
                       hover:bg-blue-50 cursor-pointer !border !border-gray-100"
          >
            <input
              type="checkbox"
              value={e.FieldCode}
              checked={selectedCheckboxes.some(
                (checkbox) => checkbox.fcode === e.FieldCode
              )}
              onChange={() =>
                handleCheckboxChange(
                  e.FieldCode,
                  "O",
                  e.FieldName,
                  e.DisplayOrder
                )
              }
              className="h-4 w-4 text-blue-600 rounded
                         focus:ring-blue-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">
              {e.FieldName}
            </span>
          </label>
        ))}

      </div>
    </div>
  </div>

  {/* Host Username */}
  <div className="grid md:grid-cols-3 gap-4 items-start">
    <label className="text-sm font-semibold text-gray-700 md:pt-3">
      Host Username
    </label>

    <div className="md:col-span-2">
      <input
        type="text"
        value={hostUserName}
        onChange={(e) => setHostUserName(e.target.value)}
        placeholder="Enter host username"
        className="w-full h-11 rounded-xl !border !border-blue-200 px-4 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>

  {/* Host Password */}
  <div className="grid md:grid-cols-3 gap-4 items-start">
    <label className="text-sm font-semibold text-gray-700 md:pt-3">
      Host Password
    </label>

    <div className="md:col-span-2">
      <input
        type="text"
        value={hostPassword}
        onChange={(e) => setHostPassword(e.target.value)}
        placeholder="Enter host password"
        className="w-full h-11 rounded-xl !border !border-blue-200 px-4 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>

  {/* Buttons */}
  <div className="flex items-center justify-between pt-4">
    <button
      onClick={() => handelIndexChange(1)}
      className="px-5 h-11 rounded-lg !border !border-gray-300
                 text-gray-700 font-medium hover:bg-gray-50 transition"
    >
      ← Previous
    </button>

    <button
      onClick={handelConfigurationSubmit}
      className="px-6 h-11 rounded-lg bg-blue-600 text-white font-semibold
                 shadow hover:bg-blue-700 transition"
    >
      Next →
    </button>
  </div>

</div>
): currentIndex===3 ? (
    
    <div className="tab-pane active">
   
     {/* Top Action */}
     <div className="flex items-center justify-between mb-6">
       <h3 className="text-lg font-semibold text-gray-800">
         Speaker Details
       </h3>
   
       <button
         onClick={handelSetPopUp}
         className="inline-flex items-center gap-2 px-4 py-2
                    bg-blue-600 hover:bg-blue-700
                    text-white text-sm font-semibold
                    rounded-lg shadow transition"
       >
         <i className="icofont icofont-plus"></i>
         Add Speaker
       </button>
     </div>
   
     {/* Speaker List */}
   <div className="space-y-4">
  {allSpeaker && allSpeaker.length > 0 ? (
    allSpeaker.map((e) => (
      <div
        key={e.Id}
        className="flex items-center justify-between
                   bg-white !border !border-gray-200
                   rounded-xl p-4 shadow-sm hover:shadow-md transition"
      >
        <div className="flex items-center gap-4">
          <img
            crossOrigin="anonymous"
            src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
            alt="speaker"
            className="w-16 h-16 rounded-full object-cover border"
          />

          <div>
            <h4 className="font-semibold text-gray-800">
              {e.SpkName}
            </h4>
            <p className="text-sm text-gray-500">
              {e.SpkDesignation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handelSetEditPopUp(e.Id)}
            className="w-9 h-9 flex items-center justify-center
                       rounded-full bg-blue-100 text-blue-600
                       hover:bg-blue-200 transition"
          >
            <i className="icofont icofont-edit"></i>
          </button>

          <button
            onClick={() => handelSpekerDelete(e.Id, e.SpkImage)}
            className="w-9 h-9 flex items-center justify-center
                       rounded-full bg-red-100 text-red-600
                       hover:bg-red-200 transition"
          >
            <i className="icofont icofont-trash"></i>
          </button>
        </div>
      </div>
    ))
  ) : (
    <div className="text-center py-10 text-gray-400">
      No speakers added yet
    </div>
  )}
</div>
   
     {/* Footer Buttons */}
     <div className="flex justify-between mt-8">
       <button
         onClick={() => handelIndexChange(2)}
         className="px-5 py-2 rounded-lg !border !border-gray-300
                    text-gray-600 hover:bg-gray-100 transition"
       >
         ← Previous
       </button>
   
       <button
         onClick={() => handelIndexChange1(4)}
         className="px-5 py-2 rounded-lg
                    bg-blue-600 hover:bg-blue-700
                    text-white font-semibold shadow transition"
       >
         Next →
       </button>
     </div>
   
   </div>
                                                                ):currentIndex===4 ? (
                                                                                                                  <div className="tab-pane active">
                                                                 {/* Grid */}
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
                                                               
                                                                 {/* Bottom Buttons */}
                                                                 <div className="flex justify-between mt-8">
                                                                   <button
                                                                     onClick={() => handelIndexChange(2)}
                                                                     className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold
                                                                                hover:bg-gray-200 transition"
                                                                   >
                                                                     ← Previous
                                                                   </button>
                                                               
                                                                   <button
                                                                     onClick={handelSubmit}
                                                                     className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold
                                                                                hover:bg-blue-700 shadow-md transition"
                                                                   >
                                                                     Submit →
                                                                   </button>
                                                                 </div>
                                                               </div>
                                                                ):("")}
                                                                
                                                                
                                                                
                                                                
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
            
                \{isPopUpOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={() => setIsPopUpOpen(false)}
  >
    <div
      className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-800">
          Add Speaker
        </h3>

        <button
          onClick={handelClosePopup}
          className="w-9 h-9 flex items-center justify-center
                     rounded-full bg-gray-100 hover:bg-red-100
                     text-gray-500 hover:text-red-600
                     text-xl font-bold transition"
        >
          ×
        </button>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <img
            src={image ? URL.createObjectURL(image) : "/images/userimg.png"}
            alt="Speaker"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow"
          />

          <label
            htmlFor="upload-input"
            className="absolute inset-0 flex items-center justify-center
                       bg-black/40 rounded-full opacity-0 group-hover:opacity-100
                       cursor-pointer transition"
          >
            <i className="fas fa-pen text-white"></i>
          </label>
        </div>

        <input
          id="upload-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <p className="text-sm text-gray-500 mt-2">Speaker Photo</p>
      </div>

      {/* Form */}
      <div className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker Name
          </label>
          <input
            type="text"
            placeholder="Enter speaker name"
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl
                       !border !border-blue-300 bg-white
                       placeholder-gray-400
                       focus:outline-none
                       focus:ring-2 focus:ring-blue-500/40
                       focus:border-blue-500
                       hover:border-blue-400
                       transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker Qualification
          </label>
          <input
            type="text"
            placeholder="Enter qualification"
            onChange={(e) => setQualification(e.target.value)}
            className="w-full h-11 px-4 rounded-xl
                       !border !border-blue-300 bg-white
                       placeholder-gray-400
                       focus:outline-none
                       focus:ring-2 focus:ring-blue-500/40
                       focus:border-blue-500
                       hover:border-blue-400
                       transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker Bios Line 1
          </label>
          <input
            type="text"
            placeholder="Enter bio line"
            onChange={(e) => setLine1(e.target.value)}
            className="w-full h-11 px-4 rounded-xl !border !border-blue-300 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40
                       focus:border-blue-500 hover:border-blue-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker Bios Line 2
          </label>
          <input
            type="text"
            placeholder="Enter bio line"
            onChange={(e) => setLine2(e.target.value)}
            className="w-full h-11 px-4 rounded-xl !border !border-blue-300 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40
                       focus:border-blue-500 hover:border-blue-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker Bios Line 3
          </label>
          <input
            type="text"
            placeholder="Enter bio line"
            onChange={(e) => setLine3(e.target.value)}
            className="w-full h-11 px-4 rounded-xl !border !border-blue-300 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40
                       focus:border-blue-500 hover:border-blue-400 transition-all"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handelAddSpeaker}
          className="px-6 py-2.5 rounded-lg
                     bg-blue-600 hover:bg-blue-700
                     text-white font-semibold shadow
                     transition"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}

        {isEditPopUpOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={handelCloseEditPopup}
  >
    <div
      className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h5 className="text-xl font-semibold text-gray-800">
          Edit Speaker
        </h5>

        <button
          onClick={handelCloseEditPopup}
          className="w-9 h-9 flex items-center justify-center rounded-full
                     bg-gray-100 hover:bg-red-100
                     text-gray-500 hover:text-red-600
                     text-lg font-bold transition"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">

        {/* Avatar */}
        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={
                image1
                  ? URL.createObjectURL(image1)
                  : `${API_URL}/uploads/speaker/${imageName}`
              }
              alt="Speaker"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow"
              crossOrigin="anonymous"
            />

            <label
              htmlFor="upload-input-edit"
              className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center
                         rounded-full bg-blue-600 text-white text-sm cursor-pointer
                         hover:bg-blue-700 transition"
            >
              ✎
            </label>
          </div>

          <p className="text-sm text-gray-500 mt-2">Speaker Photo</p>

          <input
            id="upload-input-edit"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage1(e.target.files[0])}
          />
        </div>

        {/* Fields */}
        {[
          {
            label: "Speaker Name",
            value: name1,
            setter: setName1,
            placeholder: "Enter speaker name",
          },
          {
            label: "Speaker Qualification",
            value: qualification1,
            setter: setQualification1,
            placeholder: "Enter qualification",
          },
          {
            label: "Speaker Bios Line 1",
            value: line11,
            setter: setLine11,
            placeholder: "Enter bio line",
          },
          {
            label: "Speaker Bios Line 2",
            value: line21,
            setter: setLine21,
            placeholder: "Enter bio line",
          },
          {
            label: "Speaker Bios Line 3",
            value: line31,
            setter: setLine31,
            placeholder: "Enter bio line",
          },
        ].map((field, idx) => (
          <div key={idx}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>

            <input
              type="text"
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full h-11 px-4 rounded-xl
                         border border-blue-300 bg-white
                         placeholder-gray-400
                         focus:outline-none
                         focus:ring-2 focus:ring-blue-500/40
                         focus:border-blue-500
                         hover:border-blue-400
                         transition-all duration-200"
            />
          </div>
        ))}

      </div>

      {/* Footer */}
      <div className="flex justify-end px-6 py-4 border-t border-gray-100">
        <button
          onClick={() => handelSpeakerUpdate(sid)}
          className="h-11 px-6 rounded-xl bg-blue-600 text-white font-semibold
                     shadow hover:bg-blue-700 active:scale-95
                     transition-all duration-200"
        >
          Update Speaker
        </button>
      </div>
    </div>
  </div>
)}
            
                     {isPreviewOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center
                         bg-black/50 backdrop-blur-sm p-4"
              onClick={handelClosePreviewPopup}
            >
              <div
                className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h5 className="text-lg font-semibold text-gray-800">
                    Poster Preview
                  </h5>
          
                  <button
                    onClick={handelClosePreviewPopup}
                    className="w-10 h-10 flex items-center justify-center
                               rounded-full bg-gray-100 hover:bg-red-100
                               text-gray-500 hover:text-red-600
                               text-xl font-bold transition"
                  >
                    ✕
                  </button>
                </div>
          
                {/* Body */}
                <div className="p-6 flex justify-center">
                  <img
                    crossOrigin="anonymous"
                    src={`${API_URL}/uploads/poster/${selectedPoster}`}
                    alt="Poster Preview"
                    className="max-h-[70vh] w-auto rounded-xl shadow-lg object-contain"
                  />
                </div>
              </div>
            </div>
          )}

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