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
                                                        <div className="card">
                                                            <div className="card-body">
                                                                <div className="alert alert-success mdetails fw-bold" role="alert">
                                                                    <i className="icofont icofont-checked mr-2"></i>
                                                                    Meeting Title : {singalMeet.Title}
                                                                </div>
                                                                <div className="card">
                                                                    <div className="card-status bg-blue"></div>
                                                                    <div className="card-header">
                                                                        <h3 className="card-title">Meeting Details</h3>

                                                                    </div>
                                                                    <div className="card-body">

                                                                        <div className="m-2 mdetails">
                                                                            <b>Meeting Type: </b> Online Meeting
                                                                        </div>
                                                                        <div className="m-2 mdetails">
                                                                            <b>Meeting Start Date: </b> {singalMeet.EventStartDateTime}
                                                                        </div>
                                                                        <div className="m-2 mdetails">
                                                                            <b>Meeting End Date: </b> {singalMeet.EventEndDateTime}
                                                                        </div>
                                                                        
                                                                        <div className="m-2 mdetails">
                                                                            <b>Coordinator Name: </b> {singalMeet.Name}
                                                                        </div>
                                                                        <div className="m-2 mdetails">
                                                                            <b>Coordinator Mobile: </b> {singalMeet.Mobile}
                                                                        </div>
                                                                        {/* <div className="m-2 d-flex mdetails">
                                                                            <b>Presenter Link: </b> <input name="url"
                                                                                type="text" className="form-control"
                                                                                value={singalMeet.PresenterUrl} readOnly
                                                                                ref={inputRef1} />
                                                                                 <button className="btn btn-primary ml-2" onClick={handleCopyClick1}>
                                                                                        Copy
                                                                                    </button>
                                                                        </div> */}
                                                                        <div className="m-2 d-flex mdetails">
                                                                            <b>Attendence Link: </b> <input name="url"
                                                                                type="text" className="form-control"
                                                                                value={singalMeet.AttendeeUrl}
                                                                                readOnly
                                                                                ref={inputRef2}
                                                                                />
                                                                                <button className="btn btn-primary ml-2" title='Copy Link' onClick={handleCopyClick2}>
                                                                                        Copy
                                                                                    </button>
                                                                        </div>
                                                                        <div className="m-2 mdetails">
                                                                            <b>Meeting Id: </b> {singalMeet.MeetingId}
                                                                        </div>
                                                                        <div className="m-2 mdetails">
                                                                            <b>Passcode: </b> {singalMeet.Passcode}
                                                                        </div>
                                                                        <div className="m-2 mdetails">
                                                                            <b>Download: </b> <button type="button"
                                                                                className="btn btn-danger"
                                                                                onClick={()=> handelSave(1)}
                                                                                ><i
                                                                                    className="icofont icofont-download-alt mr-4"></i>
                                                                                Download
                                                                                JPG</button>

                                                                                <button className="btn btn-danger ml-2" onClick={handelSave1}>
                                                                                <i className="icofont icofont-envelope mr-4"></i>
                                                                                    Email
                                                                                </button>

                                                                                <div className="dropdown ml-2">
                                                                                                    <button className="btn btn-danger"
                                                                                                    onClick={handleButtonClick}>  
                                                                                                    <i className="icofont icofont-plus"></i>
                                                                                                    Add To Calender
                                                                                                    {/* <i className="icofont icofont-calendar"></i> */}
                                                                                                    </button>
                                                                                                    {showOptions && (
                                                                                                        <div className="dropdown-content">
                                                                                                        <div className='d-flex justify-content-between dmain' onClick={handleOptionChange1} >
                                                                                                            <div>
                                                                                                               <p className='sptag'>Gmail</p>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <img className='simg' src="https://s2.webeventconsole.com/common/icon/calendar/gmail.png" alt="Gmail" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                       
                                                                                                        <div className='d-flex justify-content-between dmain' onClick={handleOptionChange2}>
                                                                                                            <div>
                                                                                                               <p className='sptag'>Yahoo</p>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <img className='simg' src="https://s2.webeventconsole.com/common/icon/calendar/yahoo.png" alt="Yahoo" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='d-flex justify-content-between dmain' onClick={handleOptionChange3}>
                                                                                                            <div>
                                                                                                               <p className='sptag'>HotMail</p>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <img className='simg' src="https://s2.webeventconsole.com/common/icon/calendar/hotmail.png" alt="HotMail" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div className='d-flex justify-content-between dmain' onClick={handleOptionChange4}>
                                                                                                            <div>
                                                                                                               <p className='sptag'>OutLook</p>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <img className='simg' src="https://s2.webeventconsole.com/common/icon/calendar/outlook.png" alt="OutLook" />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        
                                                                                                        </div>
                                                                                                    )}
                                                                                </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="card">
                                                                    <div className="card-status bg-red-dark"></div>
                                                                    <div className="card-header">
                                                                        <h3 className="card-title">Speaker Details</h3>

                                                                    </div>
                                                                    {speaker && speaker.length>0 && speaker.map((e)=>(
                                                                        <div key={e.Id} className="pl-4 pr-4">
                                                                        <div className="card">
                                                                            <div className="card-body">
                                                                                <div className="media">
                                                                                      <img  crossOrigin="anonymous" className='Spk_image' src={`${API_URL}/uploads/speaker/${e.SpkImage}`} alt="Speaker Image" />
                                                                                    <div className="media-body">
                                                                                        <h4 className="m-0">{e.SpkName}
                                                                                        </h4>
                                                                                        <p className="text-muted mb-0">
                                                                                        {e.SpkDesignation}</p>
                                                                                        <p className="text-muted mb-0">{e.Bio1}
                                                                                        </p>
                                                                                        <p className="text-muted mb-0">{e.Bio2}
                                                                                        </p>
                                                                                        <p className="text-muted mb-0">{e.Bio3}
                                                                                        </p>

                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
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