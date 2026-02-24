import React, { useEffect, useRef, useState } from 'react'
import domtoimage from "dom-to-image";
import './MeetingDetails.css'
import axios from 'axios';

import { useParams } from 'react-router-dom';
import { API_URL } from '../../utils/constant';
import { toast } from 'react-toastify';
import Loader from '../../utils/Loader';
import moment from 'moment';
const MeetingDetails1 = () => {

    //const [base64Url, setBase64Url] = useState();
    const [showEmailPopUp, setShowEmailPopUp] = useState(false);
    const [email, setEmail] = useState('')
    const [imgFile,setImgFile]= useState('')
    const [singalMeet, setSingalMeet] = useState({})
    const [speaker, setSpeaker] = useState([])
    const [posterImage,setPosterImage] = useState({}) 
    const [posterId, setPosterId] = useState(0);
    const [fieldData, setFieldData] = useState([]);
    const [speakerFieldData, setSpeakerFieldData] = useState([]);
    const {id} = useParams();
    const [loader, setLoader]= useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const handelCloseEamilPopup = ()=>{
        setShowEmailPopUp(false)
    }

    const handleButtonClick = () => {
        setShowOptions(!showOptions);
      };

    const handelSendEmail = async () => {
        
        const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

        if(!isEmailValid){
            toast.error("Invalid Email");
            return
        }
        const loadingToastId = toast.info("Sending Email...");
            try {
                const formData = new FormData();
                formData.append('image',imgFile);
                formData.append('email',email);
                // formData.append('meetingId',singalMeet.MeetingId);
                // formData.append('passcode', singalMeet.Passcode);
                // formData.append('url', singalMeet.AttendeeUrl);


                const res = await axios.post(
                    `${API_URL}/genral/sendMail`,
                    formData
                );
                toast.dismiss(loadingToastId);
               if(res.data.errorCode==="1"){
                toast.success("Email Send")
                setShowEmailPopUp(false)
               }
                
            } catch (error) {
                toast.dismiss(loadingToastId);
                console.log(error);
            }
            
      
        // setShowEmailPopUp(false);
    };

    // const spkdata = [
    //     {
    //         imgh:200,
    //         imgw:200,
    //         imgx:20,
    //         imgy:40,
    //         snh:200,
    //         snw:300,
    //         snx:35,
    //         sny:40,
    //         snf:100,
    //         sqh:200,
    //         sqw:300,
    //         sqx:35,
    //         sqy:45,
    //         sqf:100,
    //     },
    //     {
    //         imgh:200,
    //         imgw:200,
    //         imgx:20,
    //         imgy:50,
    //         snh:200,
    //         snw:300,
    //         snx:35,
    //         sny:50,
    //         snf:100,
    //         sqh:200,
    //         sqw:300,
    //         sqx:35,
    //         sqy:55,
    //         sqf:100,
    //     },
    //     {
    //         imgh:200,
    //         imgw:200,
    //         imgx:20,
    //         imgy:60,
    //         snh:200,
    //         snw:300,
    //         snx:35,
    //         sny:60,
    //         snf:100,
    //         sqh:200,
    //         sqw:300,
    //         sqx:35,
    //         sqy:65,
    //         sqf:100,
    //     }
    // ]

    useEffect(()=>{
        getMeetingById()
        getSpeaker()
        getPosterById();
     },[])
        
   
      
    
     async function getMeetingById(){
        try {
            const res = await axios.get(`${API_URL}/virtualMeet/getVirtualMeetingByIdWithDateFormat/${id}`);
            setSingalMeet(res?.data?.data[0]); 
           
        } catch (error) {
          console.log(error)  
        }
      }

      async function getSpeaker(){

        const fkmid = id

        try {
          const res  = await  axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);

         //  console.log(res,'inside speaker inof')
           if(res.data.errorCode=="1"){
            setSpeaker(res.data.data)
           }
        } catch (error) {
            console.log(error)
        }
    }

    async function getPosterById(){

        
    setLoader(true)
        try {
          const res  = await  axios.get(`${API_URL}/poster/getPosterById/${id}`);

          
           if(res.data.errorCode=="1"){
            setPosterImage(res?.data?.data[0])
            setPosterId(res?.data?.data[0].fk_pid);
            const poid = res?.data?.data[0].fk_pid
            await getFieldByPosterId(poid)
            await getSpeakerFieldByPosterId(poid)
           }
        } catch (error) {
            console.log(error)
        }

        setLoader(false)
    }

    async function getFieldByPosterId(poid){
       
       
        try {
          const res  = await  axios.post(`${API_URL}/poster/getFieldByPosterId`,{pid:poid});

           if(res.data.errorCode=="1"){
            setFieldData(res?.data?.data)
           
           }
        } catch (error) {
            console.log(error)
        }
    }

    async function getSpeakerFieldByPosterId(poid){
       
       
        try {
          const res  = await  axios.post(`${API_URL}/poster/getSpeakerFieldByPosterId`,{pid:poid});

           if(res.data.errorCode=="1"){
            setSpeakerFieldData(res?.data?.data)
           
           }
        } catch (error) {
            console.log(error)
        }
    }


    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);


    const handleCopyClick1 = () => {
        if (inputRef1.current) {
            navigator.clipboard.writeText(inputRef1.current.value);
        }
    };

    const handleCopyClick2 = () => {
        if (inputRef2.current) {
            navigator.clipboard.writeText(inputRef2.current.value);
            toast.info("Link copied")
        }
    };
    


    // working code
    const handelSave = async () => {

        if(!posterImage){
            toast.error("Please select poster");
            return;
        }
        const poster = document.getElementById("pdiv");


        
     
        // Create a clone of the poster element
        const posterClone = poster.cloneNode(true);

    
  

    for (let i = 0; i < fieldData.length; i++) {
        //const styleObj = fieldData[i];

        // Create a new clone of the poster element for each iteration
        //const posterClone = poster.cloneNode(true);

        // Apply styles to each element in the clone based on the index
        const elementsToStyle = ["div-title", "div-place", "div-sdate", "div-edate"];
        elementsToStyle.forEach((className, index) => {
            const elementClone = posterClone.querySelector(`.${className}${posterId}`);
            if (elementClone) {
                const { xcordinate, ycordinate, fontsize } = fieldData[index];
                elementClone.style.position = "absolute";
                elementClone.style.top = `${ycordinate}%`;
                elementClone.style.left = `${xcordinate}%`;
                elementClone.style.fontSize = `${fontsize}px`;
            }
        });

    }  

    // for adding speaker 

    for(let i=0; i<speaker.length; i++){
        const es = ["spkimg", "spkname", "spkqualification"];
        
       
            const imgClone = posterClone.querySelector(`.${es[0]}${i+1}${posterId}`);

            if (imgClone) {
                const { imgh, imgw,imgx,imgy } = speakerFieldData[i];
                imgClone.style.position = "absolute";
                imgClone.style.borderRadius = "50%";
                imgClone.style.height = `${imgh}px`;
                imgClone.style.width = `${imgw}px`;
                imgClone.style.top = `${imgy}%`;
                imgClone.style.left = `${imgx}%`;
                //imgClone.style.fontSize = `${fontsize}px`;
            }

            const nameClone = posterClone.querySelector(`.${es[1]}${i+1}${posterId}`);

            if (nameClone) {
                const { sny,snx,snf } = speakerFieldData[i];
                nameClone.style.position = "absolute";
                //nameClone.style.height = `${imgh}px`;
               // nameClone.style.width = `${imgw}px`;
                nameClone.style.top = `${sny}%`;
                nameClone.style.left = `${snx}%`;
                nameClone.style.fontSize = `${snf}px`;
            }

            const qualificationClone = posterClone.querySelector(`.${es[2]}${i+1}${posterId}`);

            if (qualificationClone) {
                const { sqy,sqx,sqf } = speakerFieldData[i];
                qualificationClone.style.position = "absolute";
               // qualificationClone.style.borderRadius = "50%";
                //qualificationClone.style.height = `${imgh}px`;
                //qualificationClone.style.width = `${imgw}px`;
                qualificationClone.style.top = `${sqy}%`;
                qualificationClone.style.left = `${sqx}%`;
                qualificationClone.style.fontSize = `${sqf}px`;
            }

          
        }
    
      
       

   
        const bgImg = new Image();
        bgImg.src = `${API_URL}/uploads/poster/${posterImage.poster_name}`;
        bgImg.crossOrigin = "anonymous";
    
        // Wait for the background image to load before generating the image
        bgImg.onload = async () => {
          // Create a temporary canvas
          const canvas = document.createElement("canvas");
          canvas.width = bgImg.width;
          canvas.height = bgImg.height;
          const ctx = canvas.getContext("2d");
    
          // Draw the background image onto the canvas
          ctx.drawImage(bgImg, 0, 0);
    
          // Draw the poster content on top of the background image
          const dataUrl = await domtoimage.toPng(posterClone, {
            width: posterImage.width,
            height: posterImage.height,
            //width:2637,
           // height:2215
          });
    
          // Get the Image data from the poster content
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            // Draw the poster content on top of the background image
            ctx.drawImage(img, 0, 0);
    
            // Convert the canvas to a data URL and create a download link
            const imageWithBackground = canvas.toDataURL("image/png");

            //console.log("base64",imageWithBackground)
            const link = document.createElement("a");
            link.href = imageWithBackground;
            link.download = "poster.png";
            link.click();

        
    
            // Clean up the temporary canvas
            canvas.remove();
          };
        };
      };


      const handelSave1 = async () => {
        if(!posterImage){
            toast.error("Please select poster");
            return;
        }
        setShowEmailPopUp(true)
        const poster = document.getElementById("pdiv");


        
     
        // Create a clone of the poster element
        const posterClone = poster.cloneNode(true);

    
  

    for (let i = 0; i < fieldData.length; i++) {
        //const styleObj = fieldData[i];

        // Create a new clone of the poster element for each iteration
        //const posterClone = poster.cloneNode(true);

        // Apply styles to each element in the clone based on the index
        const elementsToStyle = ["div-title", "div-place", "div-sdate", "div-edate"];
        elementsToStyle.forEach((className, index) => {
            const elementClone = posterClone.querySelector(`.${className}${posterId}`);
            if (elementClone) {
                const { xcordinate, ycordinate, fontsize } = fieldData[index];
                elementClone.style.position = "absolute";
                elementClone.style.top = `${ycordinate}%`;
                elementClone.style.left = `${xcordinate}%`;
                elementClone.style.fontSize = `${fontsize}px`;
            }
        });

    }  

    // for adding speaker 

    for(let i=0; i<speaker.length; i++){
        const es = ["spkimg", "spkname", "spkqualification"];
        
       
            const imgClone = posterClone.querySelector(`.${es[0]}${i+1}${posterId}`);

            if (imgClone) {
                const { imgh, imgw,imgx,imgy } = speakerFieldData[i];
                imgClone.style.position = "absolute";
                imgClone.style.borderRadius = "50%";
                imgClone.style.height = `${imgh}px`;
                imgClone.style.width = `${imgw}px`;
                imgClone.style.top = `${imgy}%`;
                imgClone.style.left = `${imgx}%`;
             
            }

            const nameClone = posterClone.querySelector(`.${es[1]}${i+1}${posterId}`);

            if (nameClone) {
                const { sny,snx,snf } = speakerFieldData[i];
                nameClone.style.position = "absolute";
             
                nameClone.style.top = `${sny}%`;
                nameClone.style.left = `${snx}%`;
                nameClone.style.fontSize = `${snf}px`;
            }

            const qualificationClone = posterClone.querySelector(`.${es[2]}${i+1}${posterId}`);

            if (qualificationClone) {
                const { sqy,sqx,sqf } = speakerFieldData[i];
                qualificationClone.style.position = "absolute";
             
                qualificationClone.style.top = `${sqy}%`;
                qualificationClone.style.left = `${sqx}%`;
                qualificationClone.style.fontSize = `${sqf}px`;
            }

          
        }
    
      
       

   
        const bgImg = new Image();
        bgImg.src = `${API_URL}/uploads/poster/${posterImage.poster_name}`;
        bgImg.crossOrigin = "anonymous";
    
        // Wait for the background image to load before generating the image
        bgImg.onload = async () => {
          // Create a temporary canvas
          const canvas = document.createElement("canvas");
          canvas.width = bgImg.width;
          canvas.height = bgImg.height;
          const ctx = canvas.getContext("2d");
    
          // Draw the background image onto the canvas
          ctx.drawImage(bgImg, 0, 0);
    
          // Draw the poster content on top of the background image
          const dataUrl = await domtoimage.toPng(posterClone, {
            width: posterImage.width,
            height: posterImage.height,
            //width:2637,
           // height:2215
          });
    
          // Get the Image data from the poster content
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            // Draw the poster content on top of the background image
            ctx.drawImage(img, 0, 0);
    
            // Convert the canvas to a data URL and create a download link
            const imageWithBackground = canvas.toDataURL("image/png");

            //console.log("base64",imageWithBackground)
            // const link = document.createElement("a");
            // link.href = imageWithBackground;
            // link.download = "poster.png";
            // link.click();

            canvas.toBlob(async (blob) => {
                // Create a File object from the Blob
                const file = new File([blob], `${posterImage.poster_name}`, { type: "image/png" });
            
                   
                setImgFile(file)
        }, "image/png");

             //setBase64Url(imageWithBackground)
    
            // Clean up the temporary canvas
            canvas.remove();
          };
        };
      };

      const handleOptionChange1 = async()=>{
        const startMoment = moment(singalMeet.EventStartDateTime, 'MMM D, YYYY, hh:mm A');
        const endMoment = moment(singalMeet.EventEndDateTime, 'MMM D, YYYY, hh:mm A');
    
        const formattedStartDateTime = startMoment.format('YYYYMMDDTHHmmss');
        const formattedEndDateTime = endMoment.format('YYYYMMDDTHHmmss');
        const eventData = {
            EventStartDateTime:formattedStartDateTime,
            EventEndDateTime:formattedEndDateTime,
            AttendeeUrl:singalMeet.AttendeeUrl,
            Title:singalMeet.Title,
            Name:singalMeet.Name
        }
    
        try {
            const response = await fetch(`${API_URL}/generate-google-calendar-url`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventData),
            });
      
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
      
            const result = await response.json();
            console.log(result.calendarUrl);
      
            // Perform actions with the generated calendarUrl, e.g., redirect the user
            window.open(result.calendarUrl, '_blank');
          } catch (error) {
            console.error('Error:', error.message);
          }
    
        }
        const handleOptionChange2 = async()=>{
            const startMoment = moment(singalMeet.EventStartDateTime, 'MMM D, YYYY, hh:mm A');
            const endMoment = moment(singalMeet.EventEndDateTime, 'MMM D, YYYY, hh:mm A');
        
            const formattedStartDateTime = startMoment.format('YYYYMMDDTHHmmss');
            const formattedEndDateTime = endMoment.format('YYYYMMDDTHHmmss');
        
            const eventData = {
                EventStartDateTime:formattedStartDateTime,
                EventEndDateTime:formattedEndDateTime,
                AttendeeUrl:singalMeet.AttendeeUrl,
                Title:singalMeet.Title,
                Name:singalMeet.Name
            }
        
            try {
                const response = await fetch(`${API_URL}/generate-yahoo-calendar-url`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(eventData),
                });
          
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
          
                const result = await response.json();
               
                // Perform actions with the generated calendarUrl, e.g., redirect the user
                window.open(result.calendarUrl, '_blank');
              } catch (error) {
                console.error('Error:', error.message);
              }
        } 
        const handleOptionChange3 = async()=>{
            
            const startMoment = moment(singalMeet.EventStartDateTime, 'MMM D, YYYY, hh:mm A');
            const endMoment = moment(singalMeet.EventEndDateTime, 'MMM D, YYYY, hh:mm A');
        
            const formattedStartDateTime = startMoment.format('YYYYMMDDTHHmmss');
            const formattedEndDateTime = endMoment.format('YYYYMMDDTHHmmss');
        
            const eventData = {
                EventStartDateTime:formattedStartDateTime,
                EventEndDateTime:formattedEndDateTime,
                AttendeeUrl:singalMeet.AttendeeUrl,
                Title:singalMeet.Title
            }
         
            try {
                const response = await fetch(`${API_URL}/generate-ics-file`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(eventData),
                });
            
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
            
                const blob = await response.blob();
            
                // Create a link and trigger a click to download the file
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', 'event.ics');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (error) {
                console.error('Error:', error.message);
              }
        } 
        const handleOptionChange4 = async()=>{
          
        const startMoment = moment(singalMeet.EventStartDateTime, 'MMM D, YYYY, hh:mm A');
        const endMoment = moment(singalMeet.EventEndDateTime, 'MMM D, YYYY, hh:mm A');
    
        const formattedStartDateTime = startMoment.format('YYYYMMDDTHHmmss');
        const formattedEndDateTime = endMoment.format('YYYYMMDDTHHmmss');
    
        const eventData = {
            EventStartDateTime:formattedStartDateTime,
            EventEndDateTime:formattedEndDateTime,
            AttendeeUrl:singalMeet.AttendeeUrl,
            Title:singalMeet.Title
        }
     
        try {
            const response = await fetch(`${API_URL}/generate-ics-file`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(eventData),
            });
        
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
        
            const blob = await response.blob();
        
            // Create a link and trigger a click to download the file
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', 'event.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.error('Error:', error.message);
          }
        }

  return loader ? <Loader/> : (
    <div className="pcoded-content">
                            <div className="pcoded-inner-content">
                                <div className="main-body">
                                    <div className="page-wrapper">

                                        <div className="page-body">
                                            <div className="container">
                                                <h1 className="page-title">
                                                    Meeting deatils
                                                </h1>


                                                <div className="row">

                                                <div className="col-lg-4" id='pdiv'>
                                                        <div className="card card-profile rel-div">

                                                            <img 
                                                            src={posterImage ? `${API_URL}/uploads/poster/${posterImage.poster_name}`:""}
                                                             alt="Poster Image"
                                                             crossOrigin="anonymous"
                                                            
                                                                style={{width:'100%'}}/>

                                                        <div className={`div-title${posterId}`}>
                                                           Meeting Title : {singalMeet.Title}
                                                        </div>
                                     

                                                        <div className={`div-sdate${posterId}`}>
                                                           sdate: {singalMeet.EventStartDateTime}
                                                        </div>
                                                        <div className={`div-edate${posterId}`}>
                                                           edate : {singalMeet.EventEndDateTime}
                        
                                                        </div>
                                                        {speaker && speaker.length >0 && speaker.map((e,i)=>(
                                                             <div key={e.Id}>
                                                             <div>
                                                              <img  crossOrigin="anonymous" className={`spkimg${i+1}${posterId}`}
                                                              src={`${API_URL}/uploads/speaker/${e.SpkImage}`} 
                                                              alt="Speaker Image" />
                                                             </div>
     
                                                             <div className={`spkname${i+1}${posterId}`}>
                                                                {e.SpkName}
                                                             </div>
                                                             <div className={`spkqualification${i+1}${posterId}`}>
                                                                {e.SpkDesignation}
                                                             </div>
                                                         </div>
                                                        )

                                                        )
                                                       
                                                        }
                                                        </div>
                                                        

                                                    </div>
                                                    <div className="col-lg-8">
                                                   <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

  {/* Success Alert */}
  <div className="mb-6 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-700 font-semibold">
    <i className="icofont icofont-checked mr-2"></i>
    Meeting Title : {singalMeet.Title}
  </div>

  {/* ================= Meeting Details ================= */}
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
    
    <div className="px-6 py-4 border-b border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800">
        Meeting Details
      </h3>
    </div>

    <div className="p-6 space-y-3 text-sm text-gray-700">

      <p><span className="font-semibold">Meeting Type:</span> Online Meeting</p>
      <p><span className="font-semibold">Meeting Start Date:</span> {singalMeet.EventStartDateTime}</p>
      <p><span className="font-semibold">Meeting End Date:</span> {singalMeet.EventEndDateTime}</p>
      <p><span className="font-semibold">Coordinator Name:</span> {singalMeet.Name}</p>
      <p><span className="font-semibold">Coordinator Mobile:</span> {singalMeet.Mobile}</p>

      {/* Attendance Link */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="font-semibold whitespace-nowrap">Attendance Link:</span>

        <input
          type="text"
          value={singalMeet.AttendeeUrl}
          readOnly
          ref={inputRef2}
          className="flex-1 h-10 rounded-lg border border-blue-200 px-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleCopyClick2}
          className="h-10 px-4 rounded-lg bg-blue-600 text-white font-medium
                     hover:bg-blue-700 transition"
        >
          Copy
        </button>
      </div>

      <p><span className="font-semibold">Meeting Id:</span> {singalMeet.MeetingId}</p>
      <p><span className="font-semibold">Passcode:</span> {singalMeet.Passcode}</p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">

        <button
          onClick={() => handelSave(1)}
          className="px-4 h-10 rounded-lg bg-red-600 text-white font-medium
                     hover:bg-red-700 transition flex items-center gap-2"
        >
          <i className="icofont icofont-download-alt"></i>
          Download JPG
        </button>

        <button
          onClick={handelSave1}
          className="px-4 h-10 rounded-lg bg-red-600 text-white font-medium
                     hover:bg-red-700 transition flex items-center gap-2"
        >
          <i className="icofont icofont-envelope"></i>
          Email
        </button>

        {/* Calendar Dropdown */}
        <div className="relative">
          <button
            onClick={handleButtonClick}
            className="px-4 h-10 rounded-lg bg-red-600 text-white font-medium
                       hover:bg-red-700 transition flex items-center gap-2"
          >
            <i className="icofont icofont-plus"></i>
            Add To Calendar
          </button>

          {showOptions && (
            <div className="absolute z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">

              {[
                { name: "Gmail", img: "gmail.png", fn: handleOptionChange1 },
                { name: "Yahoo", img: "yahoo.png", fn: handleOptionChange2 },
                { name: "HotMail", img: "hotmail.png", fn: handleOptionChange3 },
                { name: "Outlook", img: "outlook.png", fn: handleOptionChange4 },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={item.fn}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <span className="text-sm font-medium">{item.name}</span>
                  <img
                    className="w-5 h-5"
                    src={`https://s2.webeventconsole.com/common/icon/calendar/${item.img}`}
                    alt={item.name}
                  />
                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </div>
  </div>

  {/* ================= Speaker Details ================= */}
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

    <div className="px-6 py-4 border-b border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800">
        Speaker Details
      </h3>
    </div>

    <div className="p-6 space-y-4">

      {speaker?.map((e) => (
        <div
          key={e.Id}
          className="flex gap-4 items-start p-4 rounded-xl border border-gray-100 hover:shadow-sm transition"
        >
          <img
            crossOrigin="anonymous"
            src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
            alt="Speaker"
            className="w-16 h-16 rounded-full object-cover border"
          />

          <div>
            <h4 className="font-semibold text-gray-800">{e.SpkName}</h4>
            <p className="text-sm text-gray-500">{e.SpkDesignation}</p>
            <p className="text-sm text-gray-500">{e.Bio1}</p>
            <p className="text-sm text-gray-500">{e.Bio2}</p>
            <p className="text-sm text-gray-500">{e.Bio3}</p>
          </div>
        </div>
      ))}

    </div>
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

                            {showEmailPopUp && (
                                <div className="addEmail" id="exampleModalCenter" tabIndex="-1" role="dialog"
                                aria-labelledby="exampleModalCenterTitle" aria-hidden="true" onClick={()=>setShowEmailPopUp(false)}>
                                <div className="modal-dialog modal-dialog-centered" role="document">
                                    <div className="modal-content mdiv" onClick={e => {
                          // do not close modal if anything inside modal content is clicked
                          e.stopPropagation();
                        }}>
                                        <div className="modal-header">
                                            <h5 className="modal-title" id="exampleModalLongTitle">Send Email</h5>
                                            <button type="button" onClick={handelCloseEamilPopup} className="close" data-dismiss="modal" aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                        <div className="row">
                                <div className="col-md-3 col-lg-3">
                                    <label className="form-label">Email</label>
                                </div>
                                <div className="col-md-10 col-lg-10">
                                    <div className="form-group">
                                        <input type="email" className="form-control" name="example-text-input"
                                           onChange={(e)=>setEmail(e.target.value)}
                                            placeholder="Enter Email"/>
                                    </div>
                                </div>
                            </div>
                                      
                                        </div>
                                        <div className="modal-footer">
                
                                            <button onClick={handelSendEmail} type="button" className="btn btn-primary">Submit</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
  )
}

export default MeetingDetails1