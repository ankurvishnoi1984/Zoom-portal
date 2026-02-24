import React, { useEffect, useRef, useState } from "react";
import domtoimage from "dom-to-image";
import "./MeetingDetails.css";
import axios from "axios";

import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../utils/constant";
import { toast } from "react-toastify";
import Loader from "../../utils/Loader";
import moment from "moment";
import InvitationPopup from "../popup/PopupInvitation";
import jsPDF from "jspdf";

const MeetingDetails1 = () => {
  //const [base64Url, setBase64Url] = useState();
  //const navigate = useNavigate();
  const [showEmailPopUp, setShowEmailPopUp] = useState(false);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [imgFile, setImgFile] = useState("");
  const [singalMeet, setSingalMeet] = useState({});
  const [speaker, setSpeaker] = useState([]);
  const [posterImage, setPosterImage] = useState({});
  const [posterId, setPosterId] = useState(0);
  const [fieldData, setFieldData] = useState([]);
  const [speakerFieldData, setSpeakerFieldData] = useState([]);
  const { id } = useParams();
  const [loader, setLoader] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [invitation, setInvitation] = useState("");

  // setting meetingid and hostId
  const [hostId, setHostId] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [evntType,setEventType] = useState("")

  const [showPassword, setShowPassword] = useState(false);

  //console.log("singal meett dfdfdfdf", singalMeet);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handelCloseEamilPopup = () => {
    setShowEmailPopUp(false);
  };

  const handleButtonClick = () => {
    setShowOptions(!showOptions);
  };

  const handleCancel = () => {
    setShowInvitationPopup(false);
  };
  const handleConform = () => {
    setShowInvitationPopup(false);
  };
  const handelSendEmail = async () => {

    if(!email){
      toast.error("Please enter email");
      return;
    }
    const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

    if (!isEmailValid) {
      toast.error("Invalid Email");
      return;
    }
    setShowEmailPopUp(false);
    const formData = new FormData();
    formData.append("image", imgFile);
    formData.append("email", email);
    formData.append("meetingId", singalMeet.MeetingId);
    formData.append("passcode", singalMeet.Passcode);
    formData.append("url", singalMeet.AttendeeUrl);
    formData.append("murl", singalMeet.ModeratorUrl);
    formData.append("title", singalMeet.Title);
    formData.append("eventStartDate", singalMeet.EventStartDateTime);
    formData.append("eventEndDate", singalMeet.EventEndDateTime);
    
    toast.promise(axios.post(`${API_URL}/genral/sendMail`, formData),{
     pending: 'Sending email...',
     success: 'Email sent successfully!',
     error: 'Error in sending mail'
   }).then((res) => {
    if (res.data.errorCode === "1") {
     // setShowEmailPopUp(false);
    } else {
      toast.error("Error in sending mail");
    }
  }).catch((error) => {
    console.log(error);
    toast.error("Error in sending mail");
  }).finally(() => {
   setEmail('')
});
    
};

  const handelSendEmail1 = async () => {

    if(!email){
      toast.error("Please enter email");
      return;
    }
    const emailArray = email.split(',');

    // Check if all emails are valid
    const areAllEmailsValid = emailArray.every(em => {
        // Trim each email to remove leading/trailing spaces
        const trimmedEmail = em.trim();
        // Validate the trimmed email using regex
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(trimmedEmail);
    });
    if (!areAllEmailsValid) {
      toast.error("Invalid Email");
      return;
    }
   
    setShowEmailPopUp(false);
      const formData = new FormData();
      formData.append("email", email);
      formData.append("meetingId", singalMeet.MeetingId);
      formData.append("passcode", singalMeet.Passcode);
      formData.append("url", singalMeet.AttendeeUrl);
      formData.append("murl", singalMeet.ModeratorUrl);
      formData.append("title", singalMeet.Title);
      formData.append("eventStartDate", singalMeet.EventStartDateTime);
      formData.append("eventEndDate", singalMeet.EventEndDateTime);

      toast.promise(axios.post(`${API_URL}/genral/sendMail`, formData),{
        pending: 'Sending email...',
        success: 'Email sent successfully!',
        error: 'Error in sending mail'
      }).then((res) => {
       if (res.data.errorCode === "1") {
        // setShowEmailPopUp(false);
       } else {
         toast.error("Error in sending mail");
       }
     }).catch((error) => {
       console.log(error);
       toast.error("Error in sending mail");
     }).finally(() => {
      setEmail('')
   });
  };

  const handelEamilFun = () => {
    setShowEmailPopUp(true);
  };

  useEffect(() => {
    getMeetingById();
    getSpeaker();
    getPosterById();
  }, []);

  async function getMeetingById() {
    try {
      const res = await axios.get(
        `${API_URL}/virtualMeet/getVirtualMeetingByIdWithDateFormat/${id}`
      );
      console.log("singal meet data", res.data);
      setSingalMeet(res?.data?.data[0]);
      setHostId(res?.data?.data[0].AccountId);
      setMeetingId(res?.data?.data[0].MeetingId);
      setEventType(res?.data?.data[0].EventWebType)
    } catch (error) {
      console.log(error);
    }
  }

  async function getSpeaker() {
    const fkmid = id;

    try {
      const res = await axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);

      //  console.log(res,'inside speaker inof')
      if (res.data.errorCode == "1") {
        setSpeaker(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getPosterById() {
    setLoader(true);
    try {
      const res = await axios.get(`${API_URL}/poster/getPosterById/${id}`);

      if (res.data.errorCode == "1") {
        setPosterImage(res?.data?.data[0]);
        setPosterId(res?.data?.data[0].fk_pid);
        const poid = res?.data?.data[0].fk_pid;
        await getFieldByPosterId(poid);
        await getSpeakerFieldByPosterId(poid);
      }
    } catch (error) {
      console.log(error);
    }

    setLoader(false);
  }

  async function getFieldByPosterId(poid) {
    try {
      const res = await axios.post(`${API_URL}/poster/getFieldByPosterId`, {
        pid: poid,
      });

      if (res.data.errorCode == "1") {
        setFieldData(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getSpeakerFieldByPosterId(poid) {
    try {
      const res = await axios.post(
        `${API_URL}/poster/getSpeakerFieldByPosterId`,
        { pid: poid }
      );

      if (res.data.errorCode == "1") {
        setSpeakerFieldData(res?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const inputRef2 = useRef(null);

  const handleCopyClick2 = () => {
    if (inputRef2.current) {
      navigator.clipboard.writeText(inputRef2.current.value);
      toast.info("Link copied");
    }
  };

  

  // working code
  // const handelSave = async () => {
  //   if (!posterImage) {
  //     toast.error("Please select poster");
  //     return;
  //   }
  //   const poster = document.getElementById("pdiv");

  //   // Create a clone of the poster element
  //   const posterClone = poster.cloneNode(true);

  //   // for (let i = 0; i < fieldData.length; i++) {
  //   //     //const styleObj = fieldData[i];

  //   //     // Create a new clone of the poster element for each iteration
  //   //     //const posterClone = poster.cloneNode(true);

  //   //     // Apply styles to each element in the clone based on the index
  //   //     const elementsToStyle = ["div-title", "div-place", "div-sdate", "div-edate"];
  //   //     elementsToStyle.forEach((className, index) => {
  //   //         const elementClone = posterClone.querySelector(`.${className}${posterId}`);
  //   //         console.log(elementClone);
  //   //         if (elementClone) {
  //   //             const { xcordinate, ycordinate, fontsize } = fieldData[index];
  //   //             elementClone.style.position = "absolute";
  //   //             elementClone.style.top = `${ycordinate}%`;
  //   //             elementClone.style.left = `${xcordinate}%`;
  //   //             elementClone.style.fontSize = `${fontsize}px`;
  //   //         }
  //   //     });

  //   // }

  //   // Apply styles to each element in the clone based on the index
  //   const elementsToStyle = [
  //     "div-title",
  //     "div-place",
  //     "div-sdate",
  //     "div-edate",
  //   ];

  //   const titleClone = posterClone.querySelector(
  //     `.${elementsToStyle[0]}${posterId}`
  //   );
   
  //   if (titleClone) {
  //     const { xcordinate, ycordinate, fontsize } = fieldData[0];
  //     titleClone.style.position = "absolute";
  //     titleClone.style.top = `${ycordinate}%`;
  //     //titleClone.style.left = `${xcordinate}%`;
  //     titleClone.style.fontSize = `${fontsize}px`;
  //     titleClone.style.width = "100%";
  //     titleClone.style.textAlign = "center";
  //   }

  //   const sdateClone = posterClone.querySelector(
  //     `.${elementsToStyle[2]}${posterId}`
  //   );
  
  //   if (sdateClone) {
  //     const { xcordinate, ycordinate, fontsize } = fieldData[2];
  //     sdateClone.style.position = "absolute";
  //     sdateClone.style.top = `${ycordinate}%`;
  //     sdateClone.style.left = `${xcordinate}%`;
  //     sdateClone.style.fontSize = `${fontsize}px`;
  //   }
  //   const edateClone = posterClone.querySelector(
  //     `.${elementsToStyle[3]}${posterId}`
  //   );
    
  //   if (edateClone) {
  //     const { xcordinate, ycordinate, fontsize } = fieldData[3];
  //     edateClone.style.position = "absolute";
  //     edateClone.style.top = `${ycordinate}%`;
  //     edateClone.style.left = `${xcordinate}%`;
  //     edateClone.style.fontSize = `${fontsize}px`;
  //   }

  //   // for adding speaker

  //   for (let i = 0; i < speaker.length; i++) {
  //     const es = ["spkimg", "spkname", "spkqualification"];

  //     const imgClone = posterClone.querySelector(
  //       `.${es[0]}${i + 1}${posterId}`
  //     );

  //     if (imgClone) {
  //       const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
  //       imgClone.style.position = "absolute";
  //       imgClone.style.borderRadius = "50%";
  //       imgClone.style.height = `${imgh}px`;
  //       imgClone.style.width = `${imgw}px`;
  //       imgClone.style.top = `${imgy}%`;
  //       imgClone.style.left = `${imgx}%`;
  //       //imgClone.style.fontSize = `${fontsize}px`;
  //     }

  //     const nameClone = posterClone.querySelector(
  //       `.${es[1]}${i + 1}${posterId}`
  //     );

  //     if (nameClone) {
  //       const { sny, snx, snf, snw,snta } = speakerFieldData[i];
  //       nameClone.style.position = "absolute";
  //       //nameClone.style.height = `${imgh}px`;
  //       nameClone.style.width = `${snw}px`;
  //       nameClone.style.top = `${sny}%`;
  //       nameClone.style.left = `${snx}%`;
  //       nameClone.style.fontSize = `${snf}px`;
  //      // nameClone.style.border = "1px solid black";
  //       nameClone.style.textAlign = `${snta}`;
  //       //nameClone.style.fontWeight = 'bold'
  //     }

  //     const qualificationClone = posterClone.querySelector(
  //       `.${es[2]}${i + 1}${posterId}`
  //     );

  //     if (qualificationClone) {
  //       const { sqy, sqx, sqf, sqw,sqta } = speakerFieldData[i];
  //       qualificationClone.style.position = "absolute";
  //       // qualificationClone.style.borderRadius = "50%";
  //       //qualificationClone.style.height = `${imgh}px`;
  //       qualificationClone.style.width = `${sqw}px`;
  //       qualificationClone.style.top = `${sqy}%`;
  //       qualificationClone.style.left = `${sqx}%`;
  //       qualificationClone.style.fontSize = `${sqf}px`;
  //       //qualificationClone.style.border = "1px solid black";
  //       qualificationClone.style.textAlign = `${sqta}`;
  //     }
  //   }

  //   const bgImg = new Image();
  //   bgImg.src = `${API_URL}/uploads/poster/${posterImage.poster_name}`;
  //   bgImg.crossOrigin = "anonymous";

  //   // Wait for the background image to load before generating the image
  //   bgImg.onload = async () => {
  //     // Create a temporary canvas
  //     const canvas = document.createElement("canvas");
  //     canvas.width = bgImg.width;
  //     canvas.height = bgImg.height;
  //     const ctx = canvas.getContext("2d");

  //     // Draw the background image onto the canvas
  //     ctx.drawImage(bgImg, 0, 0);

  //     // Draw the poster content on top of the background image
  //     const dataUrl = await domtoimage.toPng(posterClone, {
  //       width: posterImage.width,
  //       height: posterImage.height,
  //       //width:2637,
  //       // height:2215
  //     });

  //     // Get the Image data from the poster content
  //     const img = new Image();
  //     img.src = dataUrl;
  //     img.onload = () => {
  //       // Draw the poster content on top of the background image
  //       ctx.drawImage(img, 0, 0);

  //       // Convert the canvas to a data URL and create a download link
  //       const imageWithBackground = canvas.toDataURL("image/png");

  //       //console.log("base64",imageWithBackground)
  //       const link = document.createElement("a");
  //       link.href = imageWithBackground;
  //       link.download = "poster.png";
  //       link.click();

  //       // Clean up the temporary canvas
  //       canvas.remove();
  //     };
  //   };
  // };

  const handelSave = async (type) => {
    if (!posterImage) {
      toast.error("Please select poster");
      return;
    }
    const poster = document.getElementById("pdiv");

    // Create a clone of the poster element
    const posterClone = poster.cloneNode(true);

    const elementsToStyle = [
        "div-title",
        "div-place",
        "div-sdate",
        "div-edate",
        "div-link"
      ];

      
  
      const titleClone = posterClone.querySelector(
        `.${elementsToStyle[0]}${posterId}`
      );
     
      if (titleClone) {
        const { xcordinate, ycordinate, fontsize,fontfamily,width,textAlign,color } = fieldData[0];
        titleClone.style.position = "absolute";
        titleClone.style.top = `${ycordinate}%`;
        titleClone.style.left = `${xcordinate}%`;
        titleClone.style.fontSize = `${fontsize}px`;
        titleClone.style.width = `${width}px`;
        titleClone.style.textAlign = `${textAlign}`;
        //titleClone.style.border = "1px solid black"
        titleClone.style.fontFamily = `${fontfamily}`
        titleClone.style.color = `${color}`


      }

      const placeClone = posterClone.querySelector(
        `.${elementsToStyle[1]}${posterId}`
      );
    
      if (placeClone) {
        const { xcordinate, ycordinate, fontsize ,fontfamily } = fieldData[1];
        placeClone.style.position = "absolute";
        placeClone.style.top = `${ycordinate}%`;
        placeClone.style.left = `${xcordinate}%`;
        placeClone.style.fontSize = `${fontsize}px`;
        placeClone.style.fontFamily = `${fontfamily}`
      }
  
      const sdateClone = posterClone.querySelector(
        `.${elementsToStyle[2]}${posterId}`
      );
    
      if (sdateClone) {
        const { xcordinate, ycordinate, fontsize ,fontfamily } = fieldData[2];
        sdateClone.style.position = "absolute";
        sdateClone.style.top = `${ycordinate}%`;
        sdateClone.style.left = `${xcordinate}%`;
        sdateClone.style.fontSize = `${fontsize}px`;
        sdateClone.style.fontFamily = `${fontfamily}`
      }
      const edateClone = posterClone.querySelector(
        `.${elementsToStyle[3]}${posterId}`
      );
      
      if (edateClone) {
        const { xcordinate, ycordinate, fontsize,fontfamily } = fieldData[3];
        edateClone.style.position = "absolute";
        edateClone.style.top = `${ycordinate}%`;
        edateClone.style.left = `${xcordinate}%`;
        edateClone.style.fontSize = `${fontsize}px`;
        edateClone.style.fontFamily = `${fontfamily}`
      }

      const linkClone = posterClone.querySelector(
        `.${elementsToStyle[4]}${posterId}`
      );
      
      if (linkClone) {
        const { xcordinate, ycordinate, fontsize,fontfamily,width,textAlign,color } = fieldData[4];
        linkClone.style.position = "absolute";
        linkClone.style.top = `${ycordinate}%`;
        linkClone.style.left = `${xcordinate}%`;
        linkClone.style.fontSize = `${fontsize}px`;
        linkClone.style.width = `${width}px`;
        linkClone.style.textAlign = `${textAlign}`;
        // linkClone.style.border = "1px solid black"
        linkClone.style.fontFamily = `${fontfamily}`
        linkClone.style.color = `${color}`
        linkClone.style.fontWeight = 'bold'
      }


    // for adding speaker

    for (let i = 0; i < speaker.length; i++) {
      const es = ["spkimg", "spkname", "spkqualification"];

      const imgClone = posterClone.querySelector(
        `.${es[0]}${i + 1}${posterId}`
      );

      if (imgClone) {
        const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
        imgClone.style.position = "absolute";
        imgClone.style.borderRadius = "50%";
        imgClone.style.height = `${imgh}px`;
        imgClone.style.width = `${imgw}px`;
        imgClone.style.top = `${imgy}%`;
        imgClone.style.left = `${imgx}%`;
        //imgClone.style.fontSize = `${fontsize}px`;
      }

      const nameClone = posterClone.querySelector(
        `.${es[1]}${i + 1}${posterId}`
      );

      if (nameClone) {
        const { sny, snx, snf, snw,snta } = speakerFieldData[i];
        nameClone.style.position = "absolute";
        //nameClone.style.height = `${imgh}px`;
        // nameClone.style.width = `${imgw}px`;
        nameClone.style.width = `${snw}px`;
        nameClone.style.top = `${sny}%`;
        nameClone.style.left = `${snx}%`;
        nameClone.style.fontSize = `${snf}px`;
        nameClone.style.textAlign = `${snta}`;
        nameClone.style.fontFamily = '"Roboto Slab", serif'
        //nameClone.style.border = "1px solid black"
      }

      const qualificationClone = posterClone.querySelector(
        `.${es[2]}${i + 1}${posterId}`
      );

      if (qualificationClone) {
        const { sqy, sqx, sqf, sqw,sqta } = speakerFieldData[i];
        qualificationClone.style.position = "absolute";
        // qualificationClone.style.borderRadius = "50%";
        //qualificationClone.style.height = `${imgh}px`;
        qualificationClone.style.width = `${sqw}px`;
        qualificationClone.style.top = `${sqy}%`;
        qualificationClone.style.left = `${sqx}%`;
        qualificationClone.style.fontSize = `${sqf}px`;
        //qualificationClone.style.border = "1px solid black";
        qualificationClone.style.textAlign = `${sqta}`;
        qualificationClone.style.fontFamily = '"Roboto Slab", serif'
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

        if(type === 'image'){

          //console.log("base64",imageWithBackground)
          const link = document.createElement("a");
          link.href = imageWithBackground;
          link.download = "poster.png";
          link.click();
        }
        else{

           const pdf = new jsPDF();
            pdf.addImage(imageWithBackground, "PNG", 10, 10, 190, 280);
            pdf.textWithLink('                                                                                    ', 15, 240, {
              url: singalMeet.AttendeeUrl
          });
            pdf.save("poster.pdf");

         
        }



        // Clean up the temporary canvas
        canvas.remove();
      };
    };
  };

  // for link dimenstion
  
  const linkDimestion = [
    {x : 18,y : 233},
    {x : 18,y : 232},
    {x : 18,y : 278},
    {x : 18,y : 260},
    {x : 18,y : 240},
    {x : 18,y : 220},
  ]

//   const pdfDownload = async () => {
//     if (!posterImage) {
//       toast.error("Please select poster");
//       return;
//     }
//     const poster = document.getElementById("pdiv");

//     // Create a clone of the poster element
//     const posterClone = poster.cloneNode(true);

//     const elementsToStyle = [
//         "div-title",
//         "div-place",
//         "div-sdate",
//         "div-edate",
       
//       ];

      
  
//       const titleClone = posterClone.querySelector(
//         `.${elementsToStyle[0]}${posterId}`
//       );
     
//       if (titleClone) {
//         const { xcordinate, ycordinate, fontsize,fontfamily,width,textAlign,color } = fieldData[0];
//         titleClone.style.position = "absolute";
//         titleClone.style.top = `${ycordinate}%`;
//         titleClone.style.left = `${xcordinate}%`;
//         titleClone.style.fontSize = `${fontsize}px`;
//         titleClone.style.width = `${width}px`;
//         titleClone.style.textAlign = `${textAlign}`;
//         //titleClone.style.border = "1px solid black"
//         titleClone.style.fontFamily = `${fontfamily}`
//         titleClone.style.color = `${color}`


//       }

//       const placeClone = posterClone.querySelector(
//         `.${elementsToStyle[1]}${posterId}`
//       );
    
//       if (placeClone) {
//         const { xcordinate, ycordinate, fontsize ,fontfamily } = fieldData[1];
//         placeClone.style.position = "absolute";
//         placeClone.style.top = `${ycordinate}%`;
//         placeClone.style.left = `${xcordinate}%`;
//         placeClone.style.fontSize = `${fontsize}px`;
//         placeClone.style.fontFamily = `${fontfamily}`
//       }
  
//       const sdateClone = posterClone.querySelector(
//         `.${elementsToStyle[2]}${posterId}`
//       );
    
//       if (sdateClone) {
//         const { xcordinate, ycordinate, fontsize ,fontfamily } = fieldData[2];
//         sdateClone.style.position = "absolute";
//         sdateClone.style.top = `${ycordinate}%`;
//         sdateClone.style.left = `${xcordinate}%`;
//         sdateClone.style.fontSize = `${fontsize}px`;
//         sdateClone.style.fontFamily = `${fontfamily}`
//       }
//       const edateClone = posterClone.querySelector(
//         `.${elementsToStyle[3]}${posterId}`
//       );
      
//       if (edateClone) {
//         const { xcordinate, ycordinate, fontsize,fontfamily } = fieldData[3];
//         edateClone.style.position = "absolute";
//         edateClone.style.top = `${ycordinate}%`;
//         edateClone.style.left = `${xcordinate}%`;
//         edateClone.style.fontSize = `${fontsize}px`;
//         edateClone.style.fontFamily = `${fontfamily}`
//       }

      
      


//     // for adding speaker

//     for (let i = 0; i < speaker.length; i++) {
//       const es = ["spkimg", "spkname", "spkqualification"];

//       const imgClone = posterClone.querySelector(
//         `.${es[0]}${i + 1}${posterId}`
//       );

//       if (imgClone) {
//         const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
//         imgClone.style.position = "absolute";
//         imgClone.style.borderRadius = "50%";
//         imgClone.style.height = `${imgh}px`;
//         imgClone.style.width = `${imgw}px`;
//         imgClone.style.top = `${imgy}%`;
//         imgClone.style.left = `${imgx}%`;
//         //imgClone.style.fontSize = `${fontsize}px`;
//       }

//       const nameClone = posterClone.querySelector(
//         `.${es[1]}${i + 1}${posterId}`
//       );

//       if (nameClone) {
//         const { sny, snx, snf, snw,snta } = speakerFieldData[i];
//         nameClone.style.position = "absolute";
//         //nameClone.style.height = `${imgh}px`;
//         // nameClone.style.width = `${imgw}px`;
//         nameClone.style.width = `${snw}px`;
//         nameClone.style.top = `${sny}%`;
//         nameClone.style.left = `${snx}%`;
//         nameClone.style.fontSize = `${snf}px`;
//         nameClone.style.textAlign = `${snta}`;
//         //nameClone.style.border = "1px solid black"
//       }

//       const qualificationClone = posterClone.querySelector(
//         `.${es[2]}${i + 1}${posterId}`
//       );

//       if (qualificationClone) {
//         const { sqy, sqx, sqf, sqw,sqta } = speakerFieldData[i];
//         qualificationClone.style.position = "absolute";
//         // qualificationClone.style.borderRadius = "50%";
//         //qualificationClone.style.height = `${imgh}px`;
//         qualificationClone.style.width = `${sqw}px`;
//         qualificationClone.style.top = `${sqy}%`;
//         qualificationClone.style.left = `${sqx}%`;
//         qualificationClone.style.fontSize = `${sqf}px`;
//         //qualificationClone.style.border = "1px solid black";
//         qualificationClone.style.textAlign = `${sqta}`;
//       }
//     }

//     const bgImg = new Image();
//     bgImg.src = `${API_URL}/uploads/poster/${posterImage.poster_name}`;
//     bgImg.crossOrigin = "anonymous";
    

//     // Wait for the background image to load before generating the image
//     bgImg.onload = async () => {
//       // Create a temporary canvas
//       const canvas = document.createElement("canvas");
//       canvas.width = bgImg.width;
//       canvas.height = bgImg.height;
//       const ctx = canvas.getContext("2d");

//       // Draw the background image onto the canvas
//       ctx.drawImage(bgImg, 0, 0);

//       // Draw the poster content on top of the background image
//       const dataUrl = await domtoimage.toPng(posterClone, {
//         width: posterImage.width,
//         height: posterImage.height,
//         //width:2637,
//         // height:2215
//       });

//       // Get the Image data from the poster content
//       const img = new Image();
//       img.src = dataUrl;

//       const {x,y} = linkDimestion[posterId-1];
//       const meetUrl =  singalMeet && singalMeet.EventWebType ==="METZOOM"? singalMeet.AttendeeUrl : singalMeet.ModeratorUrl;
//       console.log("inside dimention",x,y);
//       img.onload = () => {
//         // Draw the poster content on top of the background image
//         ctx.drawImage(img, 0, 0);

//         // Convert the canvas to a data URL and create a download link
//         const imageWithBackground = canvas.toDataURL("image/png");

       
          

//            const pdf = new jsPDF();
//            pdf.setFontSize(12);
//             pdf.addImage(imageWithBackground, "PNG", 10, 10, 190, 280);
//             pdf.textWithLink(meetUrl, x, y, {
//               url: meetUrl
//           });
//             pdf.save("poster.pdf");

// //           const pdf = new jsPDF();

// // // Calculate dimensions and positioning for the image
// // const pageWidth = pdf.internal.pageSize.getWidth(); // Get the width of the page
// // const pageHeight = pdf.internal.pageSize.getHeight(); // Get the height of the page
// // const imageWidth = 150; // Set the width of the image
// // const imageHeight = (imageWidth / posterImage.width) * posterImage.height; // Maintain aspect ratio
// // const padding = 20; // Set padding around the image

// // // Calculate positioning to center the image on the page
// // const imageX = (pageWidth - imageWidth) / 2;
// // const imageY = (pageHeight - imageHeight) / 2;

// // // Add the image to the PDF with calculated dimensions and positioning
// // pdf.addImage(imageWithBackground, "PNG", imageX, imageY, imageWidth, imageHeight);

// // // Add clickable link text below the image
// // // const linkText = 'Click here to Join Event';
// // // const linkTextWidth = pdf.getStringUnitWidth(linkText) * pdf.internal.getFontSize();
// // // const linkTextX = (pageWidth - linkTextWidth) / 2;
// // // const linkTextY = imageY + imageHeight + padding;
// // // pdf.textWithLink(linkText, linkTextX, linkTextY, { url: singalMeet.AttendeeUrl });
// //   pdf.textWithLink(meetUrl, x, y, {
// //               url: meetUrl
// //           });

// // // Save the PDF
// // pdf.save("poster.pdf");

//         // Clean up the temporary canvas
//         canvas.remove();
//       };
//     };
//   };


const pdfDownload = async () => {
  if (!posterImage) {
    toast.error("Please select poster");
    return;
  }
  const poster = document.getElementById("pdiv");

  // Create a clone of the poster element
  const posterClone = poster.cloneNode(true);

  const elementsToStyle = [
    "div-title",
    "div-place",
    "div-sdate",
    "div-edate",
  ];

  const titleClone = posterClone.querySelector(`.${elementsToStyle[0]}${posterId}`);
  if (titleClone) {
    const { xcordinate, ycordinate, fontsize, fontfamily, width, textAlign, color } = fieldData[0];
    titleClone.style.position = "absolute";
    titleClone.style.top = `${ycordinate}%`;
    titleClone.style.left = `${xcordinate}%`;
    titleClone.style.fontSize = `${fontsize}px`;
    titleClone.style.width = `${width}px`;
    titleClone.style.textAlign = `${textAlign}`;
    titleClone.style.fontFamily = `${fontfamily}`;
    titleClone.style.color = `${color}`;
  }

  const placeClone = posterClone.querySelector(`.${elementsToStyle[1]}${posterId}`);
  if (placeClone) {
    const { xcordinate, ycordinate, fontsize, fontfamily } = fieldData[1];
    placeClone.style.position = "absolute";
    placeClone.style.top = `${ycordinate}%`;
    placeClone.style.left = `${xcordinate}%`;
    placeClone.style.fontSize = `${fontsize}px`;
    placeClone.style.fontFamily = `${fontfamily}`;
  }

  const sdateClone = posterClone.querySelector(`.${elementsToStyle[2]}${posterId}`);
  if (sdateClone) {
    const { xcordinate, ycordinate, fontsize, fontfamily } = fieldData[2];
    sdateClone.style.position = "absolute";
    sdateClone.style.top = `${ycordinate}%`;
    sdateClone.style.left = `${xcordinate}%`;
    sdateClone.style.fontSize = `${fontsize}px`;
    sdateClone.style.fontFamily = `${fontfamily}`;
  }

  const edateClone = posterClone.querySelector(`.${elementsToStyle[3]}${posterId}`);
  if (edateClone) {
    const { xcordinate, ycordinate, fontsize, fontfamily } = fieldData[3];
    edateClone.style.position = "absolute";
    edateClone.style.top = `${ycordinate}%`;
    edateClone.style.left = `${xcordinate}%`;
    edateClone.style.fontSize = `${fontsize}px`;
    edateClone.style.fontFamily = `${fontfamily}`;
  }

  // For adding speaker details
  for (let i = 0; i < speaker.length; i++) {
    const es = ["spkimg", "spkname", "spkqualification"];

    const imgClone = posterClone.querySelector(`.${es[0]}${i + 1}${posterId}`);
    if (imgClone) {
      const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
      imgClone.style.position = "absolute";
      imgClone.style.borderRadius = "50%";
      imgClone.style.height = `${imgh}px`;
      imgClone.style.width = `${imgw}px`;
      imgClone.style.top = `${imgy}%`;
      imgClone.style.left = `${imgx}%`;
    }

    const nameClone = posterClone.querySelector(`.${es[1]}${i + 1}${posterId}`);
    if (nameClone) {
      const { sny, snx, snf, snw, snta } = speakerFieldData[i];
      nameClone.style.position = "absolute";
      nameClone.style.width = `${snw}px`;
      nameClone.style.top = `${sny}%`;
      nameClone.style.left = `${snx}%`;
      nameClone.style.fontSize = `${snf}px`;
      nameClone.style.textAlign = `${snta}`;
      nameClone.style.fontFamily = '"Roboto Slab", serif'
    }

    const qualificationClone = posterClone.querySelector(`.${es[2]}${i + 1}${posterId}`);
    if (qualificationClone) {
      const { sqy, sqx, sqf, sqw, sqta } = speakerFieldData[i];
      qualificationClone.style.position = "absolute";
      qualificationClone.style.width = `${sqw}px`;
      qualificationClone.style.top = `${sqy}%`;
      qualificationClone.style.left = `${sqx}%`;
      qualificationClone.style.fontSize = `${sqf}px`;
      qualificationClone.style.textAlign = `${sqta}`;
      qualificationClone.style.fontFamily = '"Roboto Slab", serif'
    }
  }

  const bgImg = new Image();
  bgImg.src = `${API_URL}/uploads/poster/${posterImage.poster_name}`;
  bgImg.crossOrigin = "anonymous";

  // Wait for the background image to load before generating the image
  bgImg.onload = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = bgImg.width;
    canvas.height = bgImg.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bgImg, 0, 0);

    const dataUrl = await domtoimage.toPng(posterClone, {
      width: posterImage.width,
      height: posterImage.height,
    });

    const img = new Image();
    img.src = dataUrl;

    const { x, y } = linkDimestion[posterId - 1];
    const meetUrl = singalMeet && singalMeet.EventWebType === "METZOOM" ? singalMeet.AttendeeUrl : singalMeet.ModeratorUrl;

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      const imageWithBackground = canvas.toDataURL("image/png");

      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pageWidth / pageHeight;

      let renderWidth, renderHeight;
      if (imageAspectRatio > pdfAspectRatio) {
        renderWidth = pageWidth;
        renderHeight = renderWidth / imageAspectRatio;
      } else {
        renderHeight = pageHeight;
        renderWidth = renderHeight * imageAspectRatio;
      }

      const xOffset = (pageWidth - renderWidth) / 2;
      const yOffset = (pageHeight - renderHeight) / 2;

      pdf.addImage(imageWithBackground, "PNG", xOffset, yOffset, renderWidth, renderHeight);
      
      const linkText = "Click here to join meeting";
      const linkX = (pageWidth - pdf.getStringUnitWidth(linkText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor) / 2;
      //const linkY = pageHeight / 2;

      pdf.textWithLink(linkText, linkX, y, { url: meetUrl });
      
      pdf.save("poster.pdf");

      canvas.remove();
    };
  };
};


  const handelSave1 = async () => {
    if (!posterImage) {
      toast.error("Please select poster");
      return;
    }
    setShowEmailPopUp(true);
    const poster = document.getElementById("pdiv");

    // Create a clone of the poster element
    const posterClone = poster.cloneNode(true);

    const elementsToStyle = [
      "div-title",
      "div-place",
      "div-sdate",
      "div-edate",
      "div-link"
    ];

    

    const titleClone = posterClone.querySelector(
      `.${elementsToStyle[0]}${posterId}`
    );
   
    if (titleClone) {
      const { xcordinate, ycordinate, fontsize,fontfamily,width,textAlign,color } = fieldData[0];
      titleClone.style.position = "absolute";
      titleClone.style.top = `${ycordinate}%`;
      titleClone.style.left = `${xcordinate}%`;
      titleClone.style.fontSize = `${fontsize}px`;
      titleClone.style.width = `${width}px`;
      titleClone.style.textAlign = `${textAlign}`;
      //titleClone.style.border = "1px solid black"
      titleClone.style.fontFamily = `${fontfamily}`
      titleClone.style.color = `${color}`


    }

    const placeClone = posterClone.querySelector(
      `.${elementsToStyle[1]}${posterId}`
    );
  
    if (placeClone) {
      const { xcordinate, ycordinate, fontsize ,fontfamily } = fieldData[1];
      placeClone.style.position = "absolute";
      placeClone.style.top = `${ycordinate}%`;
      placeClone.style.left = `${xcordinate}%`;
      placeClone.style.fontSize = `${fontsize}px`;
      placeClone.style.fontFamily = `${fontfamily}`
    }

    const sdateClone = posterClone.querySelector(
      `.${elementsToStyle[2]}${posterId}`
    );
  
    if (sdateClone) {
      const { xcordinate, ycordinate, fontsize ,fontfamily } = fieldData[2];
      sdateClone.style.position = "absolute";
      sdateClone.style.top = `${ycordinate}%`;
      sdateClone.style.left = `${xcordinate}%`;
      sdateClone.style.fontSize = `${fontsize}px`;
      sdateClone.style.fontFamily = `${fontfamily}`
    }
    const edateClone = posterClone.querySelector(
      `.${elementsToStyle[3]}${posterId}`
    );
    
    if (edateClone) {
      const { xcordinate, ycordinate, fontsize,fontfamily } = fieldData[3];
      edateClone.style.position = "absolute";
      edateClone.style.top = `${ycordinate}%`;
      edateClone.style.left = `${xcordinate}%`;
      edateClone.style.fontSize = `${fontsize}px`;
      edateClone.style.fontFamily = `${fontfamily}`
    }

    const linkClone = posterClone.querySelector(
      `.${elementsToStyle[4]}${posterId}`
    );
    
    if (linkClone) {
      const { xcordinate, ycordinate, fontsize,fontfamily,width,textAlign,color } = fieldData[4];
      linkClone.style.position = "absolute";
      linkClone.style.top = `${ycordinate}%`;
      linkClone.style.left = `${xcordinate}%`;
      linkClone.style.fontSize = `${fontsize}px`;
      linkClone.style.width = `${width}px`;
      linkClone.style.textAlign = `${textAlign}`;
      // linkClone.style.border = "1px solid black"
      linkClone.style.fontFamily = `${fontfamily}`
      linkClone.style.color = `${color}`
      linkClone.style.fontWeight = 'bold'
    }


    // for adding speaker

    for (let i = 0; i < speaker.length; i++) {
      const es = ["spkimg", "spkname", "spkqualification"];

      const imgClone = posterClone.querySelector(
        `.${es[0]}${i + 1}${posterId}`
      );

      if (imgClone) {
        const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
        imgClone.style.position = "absolute";
        imgClone.style.borderRadius = "50%";
        imgClone.style.height = `${imgh}px`;
        imgClone.style.width = `${imgw}px`;
        imgClone.style.top = `${imgy}%`;
        imgClone.style.left = `${imgx}%`;
        //imgClone.style.fontSize = `${fontsize}px`;
      }

      const nameClone = posterClone.querySelector(
        `.${es[1]}${i + 1}${posterId}`
      );

      if (nameClone) {
        const { sny, snx, snf, snw,snta } = speakerFieldData[i];
        nameClone.style.position = "absolute";
        //nameClone.style.height = `${imgh}px`;
        // nameClone.style.width = `${imgw}px`;
        nameClone.style.width = `${snw}px`;
        nameClone.style.top = `${sny}%`;
        nameClone.style.left = `${snx}%`;
        nameClone.style.fontSize = `${snf}px`;
        nameClone.style.textAlign = `${snta}`;
        nameClone.style.fontFamily = '"Roboto Slab", serif'
        //nameClone.style.border = "1px solid black"
      }

      const qualificationClone = posterClone.querySelector(
        `.${es[2]}${i + 1}${posterId}`
      );

      if (qualificationClone) {
        const { sqy, sqx, sqf, sqw,sqta } = speakerFieldData[i];
        qualificationClone.style.position = "absolute";
        // qualificationClone.style.borderRadius = "50%";
        //qualificationClone.style.height = `${imgh}px`;
        qualificationClone.style.width = `${sqw}px`;
        qualificationClone.style.top = `${sqy}%`;
        qualificationClone.style.left = `${sqx}%`;
        qualificationClone.style.fontSize = `${sqf}px`;
        //qualificationClone.style.border = "1px solid black";
        qualificationClone.style.textAlign = `${sqta}`;
        qualificationClone.style.fontFamily = '"Roboto Slab", serif'
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
        //const link = document.createElement("a");
        //link.href = imageWithBackground;
        //link.download = "poster.png";
        //link.click();

        canvas.toBlob(async (blob) => {
          // Create a File object from the Blob
          const file = new File([blob], `${posterImage.poster_name}`, {
            type: "image/png",
          });

          setImgFile(file);
        }, "image/png");

        // Clean up the temporary canvas
        canvas.remove();
      };
    };
  };

  // working handelSave1
  //   const handelSave1 = async () => {
  //     if(!posterImage){
  //         toast.error("Please select poster");
  //         return;
  //     }
  //     setShowEmailPopUp(true)
  //     const poster = document.getElementById("pdiv");

  //     // Create a clone of the poster element
  //     const posterClone = poster.cloneNode(true);

  // for (let i = 0; i < fieldData.length; i++) {
  //     //const styleObj = fieldData[i];

  //     // Create a new clone of the poster element for each iteration
  //     //const posterClone = poster.cloneNode(true);

  //     // Apply styles to each element in the clone based on the index
  //     const elementsToStyle = ["div-title", "div-place", "div-sdate", "div-edate"];
  //     elementsToStyle.forEach((className, index) => {
  //         const elementClone = posterClone.querySelector(`.${className}${posterId}`);
  //         if (elementClone) {
  //             const { xcordinate, ycordinate, fontsize } = fieldData[index];
  //             elementClone.style.position = "absolute";
  //             elementClone.style.top = `${ycordinate}%`;
  //             elementClone.style.left = `${xcordinate}%`;
  //             elementClone.style.fontSize = `${fontsize}px`;
  //         }
  //     });

  // }

  // // for adding speaker

  // for(let i=0; i<speaker.length; i++){
  //     const es = ["spkimg", "spkname", "spkqualification"];

  //         const imgClone = posterClone.querySelector(`.${es[0]}${i+1}${posterId}`);

  //         if (imgClone) {
  //             const { imgh, imgw,imgx,imgy } = speakerFieldData[i];
  //             imgClone.style.position = "absolute";
  //             imgClone.style.borderRadius = "50%";
  //             imgClone.style.height = `${imgh}px`;
  //             imgClone.style.width = `${imgw}px`;
  //             imgClone.style.top = `${imgy}%`;
  //             imgClone.style.left = `${imgx}%`;

  //         }

  //         const nameClone = posterClone.querySelector(`.${es[1]}${i+1}${posterId}`);

  //         if (nameClone) {
  //             const { sny,snx,snf } = speakerFieldData[i];
  //             nameClone.style.position = "absolute";

  //             nameClone.style.top = `${sny}%`;
  //             nameClone.style.left = `${snx}%`;
  //             nameClone.style.fontSize = `${snf}px`;
  //         }

  //         const qualificationClone = posterClone.querySelector(`.${es[2]}${i+1}${posterId}`);

  //         if (qualificationClone) {
  //             const { sqy,sqx,sqf } = speakerFieldData[i];
  //             qualificationClone.style.position = "absolute";

  //             qualificationClone.style.top = `${sqy}%`;
  //             qualificationClone.style.left = `${sqx}%`;
  //             qualificationClone.style.fontSize = `${sqf}px`;
  //         }

  //     }

  //     const bgImg = new Image();
  //     bgImg.src = `${API_URL}/uploads/poster/${posterImage.poster_name}`;
  //     bgImg.crossOrigin = "anonymous";

  //     // Wait for the background image to load before generating the image
  //     bgImg.onload = async () => {
  //       // Create a temporary canvas
  //       const canvas = document.createElement("canvas");
  //       canvas.width = bgImg.width;
  //       canvas.height = bgImg.height;
  //       const ctx = canvas.getContext("2d");

  //       // Draw the background image onto the canvas
  //       ctx.drawImage(bgImg, 0, 0);

  //       // Draw the poster content on top of the background image
  //       const dataUrl = await domtoimage.toPng(posterClone, {
  //         width: posterImage.width,
  //         height: posterImage.height,
  //         //width:2637,
  //        // height:2215
  //       });

  //       // Get the Image data from the poster content
  //       const img = new Image();
  //       img.src = dataUrl;
  //       img.onload = () => {
  //         // Draw the poster content on top of the background image
  //         ctx.drawImage(img, 0, 0);

  //         // Convert the canvas to a data URL and create a download link
  //         const imageWithBackground = canvas.toDataURL("image/png");

  //         //console.log("base64",imageWithBackground)
  //         // const link = document.createElement("a");
  //         // link.href = imageWithBackground;
  //         // link.download = "poster.png";
  //         // link.click();

  //         canvas.toBlob(async (blob) => {
  //             // Create a File object from the Blob
  //             const file = new File([blob], `${posterImage.poster_name}`, { type: "image/png" });

  //             setImgFile(file)
  //     }, "image/png");

  //          //setBase64Url(imageWithBackground)

  //         // Clean up the temporary canvas
  //         canvas.remove();
  //       };
  //     };
  //   };

  const handleOptionChange1 = async () => {
    const startMoment = moment(
      singalMeet.EventStartDateTime,
      "MMM D, YYYY, hh:mm A"
    );
    const endMoment = moment(
      singalMeet.EventEndDateTime,
      "MMM D, YYYY, hh:mm A"
    );

    const formattedStartDateTime = startMoment.format("YYYYMMDDTHHmmss");
    const formattedEndDateTime = endMoment.format("YYYYMMDDTHHmmss");
    const eventData = {
      EventStartDateTime: formattedStartDateTime,
      EventEndDateTime: formattedEndDateTime,
      AttendeeUrl: singalMeet.AttendeeUrl,
      Title: singalMeet.Title,
      Name: singalMeet.Name,
    };

    try {
      const response = await fetch(`${API_URL}/generate-google-calendar-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.calendarUrl);

      // Perform actions with the generated calendarUrl, e.g., redirect the user
      window.open(result.calendarUrl, "_blank");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  const handleOptionChange2 = async () => {
    const startMoment = moment(
      singalMeet.EventStartDateTime,
      "MMM D, YYYY, hh:mm A"
    );
    const endMoment = moment(
      singalMeet.EventEndDateTime,
      "MMM D, YYYY, hh:mm A"
    );

    const formattedStartDateTime = startMoment.format("YYYYMMDDTHHmmss");
    const formattedEndDateTime = endMoment.format("YYYYMMDDTHHmmss");

    const eventData = {
      EventStartDateTime: formattedStartDateTime,
      EventEndDateTime: formattedEndDateTime,
      AttendeeUrl: singalMeet.AttendeeUrl,
      Title: singalMeet.Title,
      Name: singalMeet.Name,
    };

    try {
      const response = await fetch(`${API_URL}/generate-yahoo-calendar-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      // Perform actions with the generated calendarUrl, e.g., redirect the user
      window.open(result.calendarUrl, "_blank");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  const handleOptionChange3 = async () => {
    const startMoment = moment(
      singalMeet.EventStartDateTime,
      "MMM D, YYYY, hh:mm A"
    );
    const endMoment = moment(
      singalMeet.EventEndDateTime,
      "MMM D, YYYY, hh:mm A"
    );

    const formattedStartDateTime = startMoment.format("YYYYMMDDTHHmmss");
    const formattedEndDateTime = endMoment.format("YYYYMMDDTHHmmss");

    const eventData = {
      EventStartDateTime: formattedStartDateTime,
      EventEndDateTime: formattedEndDateTime,
      AttendeeUrl: singalMeet.AttendeeUrl,
      Title: singalMeet.Title,
    };

    try {
      const response = await fetch(`${API_URL}/generate-ics-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();

      // Create a link and trigger a click to download the file
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "event.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  const handleOptionChange4 = async () => {
    const startMoment = moment(
      singalMeet.EventStartDateTime,
      "MMM D, YYYY, hh:mm A"
    );
    const endMoment = moment(
      singalMeet.EventEndDateTime,
      "MMM D, YYYY, hh:mm A"
    );

    const formattedStartDateTime = startMoment.format("YYYYMMDDTHHmmss");
    const formattedEndDateTime = endMoment.format("YYYYMMDDTHHmmss");

    const eventData = {
      EventStartDateTime: formattedStartDateTime,
      EventEndDateTime: formattedEndDateTime,
      AttendeeUrl: singalMeet.AttendeeUrl,
      Title: singalMeet.Title,
    };

    try {
      const response = await fetch(`${API_URL}/generate-ics-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();

      // Create a link and trigger a click to download the file
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "event.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handelCopyInvitation = () => {
    setShowInvitationPopup(true);
  };

  async function getMeetingInvitation() {
    if (meetingId) {
      console.log("inside meeting invitation", meetingId, hostId);

      try {
        const res = await axios.post(
          `${API_URL}/virtualMeet/getMeetingInvitation`,
          { hostId, meetingId }
        );

        setInvitation(res?.data?.data.invitation);
      } catch (error) {
        console.log(error);
      }
    }
  }

  useEffect(() => {
    getMeetingInvitation();
  }, [meetingId]);

  
  //  if(singalMeet === undefined){
  //   toast.error("Please add all meeting related Data")
  //   navigate("/dashboard")
  //   return 
  //  }


  return loader ? (
    <Loader />
  ) : (
    <div className="pcoded-content">
      <div className="pcoded-inner-content">
        <div className="main-body">
          <div className="page-wrapper">
            <div className="page-body">
              <div className="container">
                <h1 className="page-title">Meeting Details</h1>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-body">
                        <div
                          className="alert alert-success title-style mdetails fw-bold"
                          role="alert"
                        >
                          <i className="icofont icofont-checked mr-2"></i>
                          Meeting Title : {singalMeet && singalMeet.Title}
                        </div>
                        <div className="card card-border bgltclr">
                          <div className="card-status bg-blue"></div>
                          <div className="card-header details-style">
                            <h3 className="card-title mfont">
                              Meeting Details
                            </h3>
                          </div>
                          <div className="row">
                            <div className="col-md-7">
                              <div className="card-body">
                                <div className="m-2 mdetails">
                                  <b>Meeting Type: </b> <span className="span-style">{evntType ==="METZOOM" ? "Zoom Meeting" : "Zoom + Webcast Meeting"}</span> 
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Meeting Start Date: </b>{" "}
                                  <span className="span-style">{singalMeet && singalMeet.EventStartDateTime}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Meeting End Date: </b>{" "}
                                 <span className="span-style"> {singalMeet && singalMeet.EventEndDateTime}</span>
                                </div>

                                <div className="m-2 mdetails">
                                  <b>Coordinator Name: </b> <span className="span-style">{singalMeet && singalMeet.Name}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Coordinator Mobile: </b>{" "}
                                  <span className="span-style">{singalMeet && singalMeet.Mobile}</span>
                                </div>

                                {evntType ==="METZOOM" ? "" : <>
                                <div className="m-2 mdetails">
                                  <b>Host User Name: </b> <span className="span-style">{singalMeet && singalMeet.username}</span>
                                </div>

                                <div className="m-2 mdetails">
                                  <b>Host Password: </b>
                                  {showPassword
                                    ? <span className="span-style">{singalMeet.password}</span>
                                    : "**********"}
                                  <span onClick={togglePasswordVisibility}>
                                    <i
                                      className="icofont icofont-eye"
                                      style={{
                                        marginLeft: "5px",
                                        cursor: "pointer",
                                        fontSize:"30px"
                                      }}
                                    ></i>
                                  </span>
                                </div>
                                </>}
                               

                                <div className="m-2 mdetails">
                                  <b>Client Name: </b> <span className="span-style">{singalMeet && singalMeet.FullName}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Department Name: </b> <span className="span-style">{singalMeet && singalMeet.DeptName}</span>
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
                                  <b>Session Link: </b>{" "}
                                  <input
                                    name="url"
                                    type="text"
                                    className="form-control"
                                    value= {singalMeet && singalMeet.EventWebType ==="METZOOM"? singalMeet.AttendeeUrl : singalMeet.ModeratorUrl}
                                    readOnly
                                    ref={inputRef2}
                                  />
                                  <button
                                    className="btn btn-primary ml-2"
                                    title="Copy Link"
                                    onClick={handleCopyClick2}
                                  >
                                    Copy
                                  </button>
                                </div>
                                {/* <div className="m-2 mdetails">
                                  <b>Meeting Id: </b> <span className="span-style">{singalMeet && singalMeet.MeetingId}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Passcode: </b> <span className="span-style">{singalMeet && singalMeet.Passcode}</span>
                                </div> */}
                                <div className="m-2 mdetails">
                                  <b>Meeting Created on : </b>{" "}
                                  <span className="span-style">{singalMeet && singalMeet.Account_name}</span>
                                </div>
                                <div className="mdetails">
                                  {singalMeet && singalMeet.IsPosterEnable === "N" ? (
                                    ""
                                  ) : (
                                    <>
                                      {/* <b>Download: </b>{" "} */}
                                      {/* <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => handelSave(1)}
                                      >
                                        <i className="icofont icofont-download-alt mr-4"></i>
                                        Download JPG
                                      </button> */}

                                      <button type="button" 
                                      onClick={() => handelSave("image")}
                                      className="btn btn-grd-success hor-grd btn-icon waves-effect waves-light ml-2"
                                      data-toggle="tooltip" data-placement="top"
                                      title="Download Poster Image">
                                      <i className="icofont icofont-download-alt mr-4"></i>
                                      </button>

                                      <button type="button" 
                                      onClick={() => pdfDownload()}
                                      className="btn btn-grd-danger hor-grd btn-icon waves-effect waves-light ml-2"
                                      data-toggle="tooltip" data-placement="top"
                                      title="Download Poster Pdf">
                                      <i className="icofont icofont-book mr-4"></i>
                                      </button>
                                    </>
                                  )}

                                  {singalMeet && singalMeet.IsPosterEnable === "N" ? (
                                    // <button
                                    //   className="btn btn-danger ml-2"
                                    //   onClick={handelEamilFun}
                                    // >
                                    //   <i className="icofont icofont-envelope mr-4"></i>
                                    //   Email
                                    // </button>

                                    <button type="button" 
                                    onClick={handelEamilFun}
                                    className="btn btn-danger hor-grd btn-icon waves-effect waves-light ml-2"
                                    data-toggle="tooltip" data-placement="top"
                                    title="Send Email">
                                    <i className="icofont icofont-envelope mr-4"></i>
                                    </button>


                                  ) : (
                                    // <button
                                    //   className="btn btn-danger ml-2"
                                    //   onClick={handelSave1}
                                    // >
                                    //   <i className="icofont icofont-envelope mr-4"></i>
                                    //   Email
                                    // </button>

                                    <button type="button" 
                                    onClick={handelSave1}
                                    className="btn btn-danger hor-grd btn-icon waves-effect waves-light ml-2"
                                    data-toggle="tooltip" data-placement="top"
                                    title="Send Email">
                                     <i className="icofont icofont-envelope mr-4"></i>
                                    </button>

                                    
                                  )}

                                  {/* <button
                                    className="btn btn-danger ml-2"
                                    onClick={handelCopyInvitation}
                                  >
                                    <i className="icofont icofont-envelope mr-4"></i>
                                    Copy Invitation
                                  </button> */}

                                    <button type="button" 
                                    onClick={handelCopyInvitation}
                                    className="btn btn-grd-primary hor-grd btn-icon waves-effect waves-light ml-2"
                                    data-toggle="tooltip" data-placement="top"
                                    title="Copy Invitation">
                                     <i className="icofont icofont-copy"></i>
                                    </button>

                                  

                                  <div className="dropdown ml-2">
                                    {/* <button
                                      className="btn btn-danger"
                                      onClick={handleButtonClick}
                                    >
                                      <i className="icofont icofont-plus"></i>
                                      Add To Calender
                                    
                                    </button> */}

                                   <button type="button" 
                                     onClick={handleButtonClick}
                                    className="btn btn-grd-warning hor-grd btn-icon waves-effect waves-light"
                                    //className="btn btn-grd-success"
                                    data-toggle="tooltip" data-placement="top"
                                    title="Add Event to Caleder">
                                     <i className="icofont icofont-calendar"></i>
                                    </button>

                                    
                                    {showOptions && (
                                      <div className="dropdown-content">
                                        <div
                                          className="d-flex justify-content-between dmain"
                                          onClick={handleOptionChange1}
                                        >
                                          <div>
                                            <p className="sptag">Gmail</p>
                                          </div>
                                          <div>
                                            <img
                                              className="simg"
                                              src="https://s2.webeventconsole.com/common/icon/calendar/gmail.png"
                                              alt="Gmail"
                                            />
                                          </div>
                                        </div>

                                        <div
                                          className="d-flex justify-content-between dmain"
                                          onClick={handleOptionChange2}
                                        >
                                          <div>
                                            <p className="sptag">Yahoo</p>
                                          </div>
                                          <div>
                                            <img
                                              className="simg"
                                              src="https://s2.webeventconsole.com/common/icon/calendar/yahoo.png"
                                              alt="Yahoo"
                                            />
                                          </div>
                                        </div>
                                        <div
                                          className="d-flex justify-content-between dmain"
                                          onClick={handleOptionChange3}
                                        >
                                          <div>
                                            <p className="sptag">HotMail</p>
                                          </div>
                                          <div>
                                            <img
                                              className="simg"
                                              src="https://s2.webeventconsole.com/common/icon/calendar/hotmail.png"
                                              alt="HotMail"
                                            />
                                          </div>
                                        </div>
                                        <div
                                          className="d-flex justify-content-between dmain"
                                          onClick={handleOptionChange4}
                                        >
                                          <div>
                                            <p className="sptag">OutLook</p>
                                          </div>
                                          <div>
                                            <img
                                              className="simg"
                                              src="https://s2.webeventconsole.com/common/icon/calendar/outlook.png"
                                              alt="OutLook"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-5">
                              {singalMeet && singalMeet.IsPosterEnable === "N" ? (
                                ""
                              ) : (
                                <div className="m-2" id="pdiv">
                                  <div className="card card-profile rel-div">
                                    <img
                                      src={
                                        posterImage
                                          ? `${API_URL}/uploads/poster/${posterImage.poster_name}`
                                          : ""
                                      }
                                      alt="Poster Image"
                                      crossOrigin="anonymous"
                                      style={{ width: "100%" }}
                                    />

                                    <div className={`div-title${posterId}`}>
                                      {singalMeet && singalMeet.Title}
                                    </div>

                                    <div className={`div-sdate${posterId}`}>
                                      {singalMeet && singalMeet.EventDate}
                                    </div>
                                    <div className={`div-edate${posterId}`}>
                                      {singalMeet && singalMeet.EventTime}
                                    </div>

                                    <div className={`div-link${posterId}`}>
                                      {singalMeet && singalMeet.EventWebType ==="METZOOM"? singalMeet.AttendeeUrl : singalMeet.ModeratorUrl}
                                    </div>
                                    


                                    {speaker &&
                                      speaker.length > 0 &&
                                      speaker.map((e, i) => (
                                        <div key={e.Id}>
                                          <div>
                                            <img
                                              crossOrigin="anonymous"
                                              className={`spkimg${
                                                i + 1
                                              }${posterId}`}
                                              src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
                                              alt="Speaker Image"
                                            />
                                          </div>

                                          <div
                                            className={`spkname${
                                              i + 1
                                            }${posterId}`}
                                          >
                                            {e.SpkName}
                                          </div>
                                          <div
                                            className={`spkqualification${
                                              i + 1
                                            }${posterId}`}
                                          >
                                            {e.SpkDesignation}
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        { speaker.length == 0 || singalMeet && singalMeet.IsPosterEnable === "N" ?"":(
                        <div className="card p-3" style={{boxShadow:"none"}}>
                          <div className="card-status bg-red-dark"></div>
                          <div className="card-header">
                            <h3 className="card-title">Speaker Details</h3>
                          </div> 
                          <div className="row">
                            {speaker &&
                              speaker.length > 0 &&
                              speaker.map((e) => (
                                <div key={e.Id} className="col-md-6">
                                  <div className="card card-border">
                                    <div className="card-body bgltclr">
                                      <div className="media">
                                        <img
                                          crossOrigin="anonymous"
                                          className="Spk_image card-border"
                                          src={`${API_URL}/uploads/speaker/${e.SpkImage}`}
                                          alt="Speaker Image"
                                        />
                                        <div className="media-body">
                                          <h4 className="m-0">{e.SpkName}</h4>
                                          <p className="text-muted mb-0">
                                            {e.SpkDesignation}
                                          </p>
                                          <p className="text-muted mb-0">
                                            {e.Bio1}
                                          </p>
                                          <p className="text-muted mb-0">
                                            {e.Bio2}
                                          </p>
                                          <p className="text-muted mb-0">
                                            {e.Bio3}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="styleSelector"></div>
          </div>
        </div>
      </div>

      {showEmailPopUp && (
        <div
          className="addEmail"
          id="exampleModalCenter"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalCenterTitle"
          aria-hidden="true"
          onClick={() => setShowEmailPopUp(false)}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div
              className="modal-content mdiv"
              onClick={(e) => {
                // do not close modal if anything inside modal content is clicked
                e.stopPropagation();
              }}
            >
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  Send Email
                </h5>
                <button
                  type="button"
                  onClick={handelCloseEamilPopup}
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
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
                      <input
                        type="email"
                        className="form-control"
                        name="example-text-input"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                      />
                    </div>
                    <p>for multiple email send below <b>,</b> seprated format</p>
                    <p>test@gmail.com,test1@gmail.com</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  onClick={
                    singalMeet &&  singalMeet.IsPosterEnable === "N"
                      ? handelSendEmail1
                      : handelSendEmail
                  }
                  type="button"
                  className="btn btn-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvitationPopup && (
        <InvitationPopup
          message={invitation}
          onConfirm={handleConform}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default MeetingDetails1;
