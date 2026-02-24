import React, { useEffect, useState } from 'react'
import domtoimage from "dom-to-image";
import './MeetingDetails.css'
import axios from 'axios';
import moment from 'moment';
//import { WhatsappIcon, WhatsappShareButton } from 'react-share';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../utils/constant';
import { toast } from 'react-toastify';
import Loader from '../../utils/Loader';

const MeetingDetails = () => {

    //const [base64Url, setBase64Url] = useState();
    const [showEmailPopUp, setShowEmailPopUp] = useState(false);
    const [email, setEmail] = useState('')
    const [imgFile,setImgFile]= useState('')
    const [singalMeet, setSingalMeet] = useState({})
    const [posterImage,setPosterImage] = useState({}) 
    const [posterId, setPosterId] = useState(0);
    const [speaker, setSpeaker] = useState([]);

    const [fieldData, setFieldData] = useState([])
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
        
            try {
                const formData = new FormData();
                formData.append('image',imgFile);
                formData.append('email',email);
                const res = await axios.post(
                    `${API_URL}/genral/sendMail`,
                    formData
                );
               if(res.data.errorCode==="1"){
                toast.success("Email Send")
                setShowEmailPopUp(false)
               }
                
            } catch (error) {
                console.log(error);
            }
      
        // setShowEmailPopUp(false);
    };


 



    useEffect(()=>{
        getMeetingById();
        getSpeaker();
        getPosterById();
        
     },[])
        
   
      
    
     async function getMeetingById(){
        try {
            const res = await axios.get(`${API_URL}/physicalMeeting/getPhysicalMeetingByIdWithDateFormat/${id}`);
            setSingalMeet(res?.data?.data[0]); 
           
        } catch (error) {
          console.log(error)  
        }
      }


      async function getSpeaker(){

        const fkmid = id

        try {
          const res  = await  axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);

          // console.log(res,'inside speaker inof')
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
            AttendeeUrl:singalMeet.EventLocation,
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
                AttendeeUrl:singalMeet.EventLocation,
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
                AttendeeUrl:singalMeet.EventLocation,
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
            AttendeeUrl:singalMeet.EventLocation,
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
        const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b last:border-0">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

const CalendarOption = ({ label, img, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
  >
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <img src={img} alt={label} className="w-5 h-5" />
  </div>
);

  return loader ? <Loader/>: (
<div className="pcoded-content">
  <div className="pcoded-inner-content">
    <div className="main-body">
      <div className="page-wrapper">
        <div className="page-body">
          <div className="container mx-auto px-4">

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Meeting Details
            </h1>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT — Poster */}
              <div className="lg:col-span-4" id="pdiv">
                <div className="bg-white rounded-2xl shadow-sm border p-3 sticky top-6">

                  <img
                    src={
                      posterImage
                        ? `${API_URL}/uploads/poster/${posterImage.poster_name}`
                        : ""
                    }
                    alt="Poster"
                    crossOrigin="anonymous"
                    className="w-full rounded-lg"
                  />

                  {/* Dynamic Fields */}
                  <div className={`div-title${posterId}`}>
                    Meeting Title : {singalMeet.Title}
                  </div>

                  <div className={`div-place${posterId}`}>
                    Meeting Place : {singalMeet.EventLocation}
                  </div>

                  <div className={`div-sdate${posterId}`}>
                    sdate: {singalMeet.EventStartDateTime}
                  </div>

                  <div className={`div-edate${posterId}`}>
                    edate : {singalMeet.EventEndDateTime}
                  </div>

                  {/* Speakers on poster */}
                  {speaker?.length > 0 &&
                    speaker.map((e, i) => (
                      <div key={e.Id}>
                        <img
                          crossOrigin="anonymous"
                          className={`spkimg${i + 1}${posterId}`}
                          src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
                          alt="Speaker"
                        />
                        <div className={`spkname${i + 1}${posterId}`}>
                          {e.SpkName}
                        </div>
                        <div
                          className={`spkqualification${i + 1}${posterId}`}
                        >
                          {e.SpkDesignation}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="lg:col-span-8 space-y-6">

                {/* Success banner */}
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg font-semibold">
                  <i className="icofont icofont-checked"></i>
                  Meeting Title : {singalMeet.Title}
                </div>

                {/* Meeting Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Meeting Details
                  </h3>

                  <div className="space-y-2 text-sm">

                    <DetailRow
                      label="Meeting Type"
                      value="Physical Meeting"
                    />

                    <DetailRow
                      label="Meeting Start Date"
                      value={singalMeet.EventStartDateTime}
                    />

                    <DetailRow
                      label="Meeting End Date"
                      value={singalMeet.EventEndDateTime}
                    />

                    <DetailRow
                      label="Meeting Venue"
                      value={singalMeet.EventLocation}
                    />

                    <DetailRow
                      label="Coordinator Name"
                      value={singalMeet.Name}
                    />

                    <DetailRow
                      label="Coordinator Mobile"
                      value={singalMeet.Mobile}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3 items-center">
                    <span className="font-semibold text-gray-700">
                      Actions:
                    </span>

                    <button
                      onClick={() => handelSave(1)}
                      className="px-4 h-10 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <i className="icofont icofont-download-alt"></i>
                      Download JPG
                    </button>

                    <button
                      onClick={handelSave1}
                      className="px-4 h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <i className="icofont icofont-envelope"></i>
                      Email
                    </button>

                    {/* Calendar */}
                    <div className="relative">
                      <button
                        onClick={handleButtonClick}
                        className="px-4 h-10 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-black transition flex items-center gap-2"
                      >
                        <i className="icofont icofont-plus"></i>
                        Add To Calendar
                      </button>

                      {showOptions && (
                        <div className="absolute z-50 mt-2 w-56 bg-white border rounded-xl shadow-lg overflow-hidden">

                          <CalendarOption
                            label="Gmail"
                            img="https://s2.webeventconsole.com/common/icon/calendar/gmail.png"
                            onClick={handleOptionChange1}
                          />

                          <CalendarOption
                            label="Yahoo"
                            img="https://s2.webeventconsole.com/common/icon/calendar/yahoo.png"
                            onClick={handleOptionChange2}
                          />

                          <CalendarOption
                            label="Hotmail"
                            img="https://s2.webeventconsole.com/common/icon/calendar/hotmail.png"
                            onClick={handleOptionChange3}
                          />

                          <CalendarOption
                            label="Outlook"
                            img="https://s2.webeventconsole.com/common/icon/calendar/outlook.png"
                            onClick={handleOptionChange4}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Speaker Details */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Speaker Details
                  </h3>

                  <div className="grid gap-4">
                    {speaker?.length > 0 &&
                      speaker.map((e) => (
                        <div
                          key={e.Id}
                          className="flex gap-4 p-4 border rounded-xl hover:shadow-sm transition"
                        >
                          <img
                            crossOrigin="anonymous"
                            src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
                            alt="Speaker"
                            className="w-16 h-16 rounded-full object-cover border"
                          />

                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {e.SpkName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {e.SpkDesignation}
                            </p>
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
    </div>
  </div>
</div>
  )
}

export default MeetingDetails