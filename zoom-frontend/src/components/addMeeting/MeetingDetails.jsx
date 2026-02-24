import React, { useEffect, useState } from "react";
import domtoimage from "dom-to-image";
import "./MeetingDetails.css";
import axios from "axios";
import moment from "moment";
//import { WhatsappIcon, WhatsappShareButton } from 'react-share';
import { useParams } from "react-router-dom";
import { API_URL } from "../../utils/constant";
import { toast } from "react-toastify";
import Loader from "../../utils/Loader";

const MeetingDetails = () => {
  //const [base64Url, setBase64Url] = useState();
  const [showEmailPopUp, setShowEmailPopUp] = useState(false);
  const [email, setEmail] = useState("");
  const [imgFile, setImgFile] = useState("");
  const [singalMeet, setSingalMeet] = useState({});
  const [posterImage, setPosterImage] = useState({});
  const [posterId, setPosterId] = useState(0);
  const [speaker, setSpeaker] = useState([]);

  const [fieldData, setFieldData] = useState([]);
  const [speakerFieldData, setSpeakerFieldData] = useState([]);
  const { id } = useParams();

  const [loader, setLoader] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handelCloseEamilPopup = () => {
    setShowEmailPopUp(false);
  };

  const handelEamilFun = () => {
    setShowEmailPopUp(true);
  };

  const handleButtonClick = () => {
    setShowOptions(!showOptions);
  };
  // const handelSendEmail = async () => {

  //     if (!email) {
  //     toast.error("Please enter email");
  //     return;
  //   }
  //   const emailArray = email.split(',');

  //   // Check if all emails are valid
  //   const areAllEmailsValid = emailArray.every(em => {
  //       // Trim each email to remove leading/trailing spaces
  //       const trimmedEmail = em.trim();
  //       // Validate the trimmed email using regex
  //       return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(trimmedEmail);
  //   });
  //   if (!areAllEmailsValid) {
  //     toast.error("Invalid Email");
  //     return;
  //   }
  //   //console.log(email)
  //   setLoader(true)
  //   try {
  //     const formData = new FormData();
  //     formData.append("image", imgFile);
  //     formData.append("email", email);
  //     formData.append("title", singalMeet.Title);
  //     formData.append("eventStartDate", singalMeet.EventStartDateTime);
  //     formData.append("eventEndDate", singalMeet.EventEndDateTime);
  //     formData.append("eventLocation", singalMeet.EventLocation);

  //     const res = await axios.post(
  //       `${API_URL}/genral/sendMailForPhysical`,
  //       formData
  //     );
  //     if (res.data.errorCode === "1") {
  //       setLoader(false);
  //       toast.success("Email Send Successfully");
  //       setShowEmailPopUp(false);
  //     } else {
  //       setLoader(false);
  //       toast.error("Error in sending mail");
  //     }
  //   } catch (error) {
  //     setLoader(false);
  //     console.log(error);
  //     toast.error("Error in sending mail");
  //   }

  //   // setShowEmailPopUp(false);
  // };

// working with toast loader
  const handelSendEmail = async () => {

    if (!email) {
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
    // Create the form data
    const formData = new FormData();
    formData.append("image", imgFile);
    formData.append("email", email);
    formData.append("title", singalMeet.Title);
    formData.append("eventStartDate", singalMeet.EventStartDateTime);
    formData.append("eventEndDate", singalMeet.EventEndDateTime);
    formData.append("eventLocation", singalMeet.EventLocation);
  
    // Use toast.promise to handle pending, success, and error states
    toast.promise(
      axios.post(`${API_URL}/genral/sendMailForPhysical`, formData),
      {
        pending: 'Sending email...',
        success: 'Email sent successfully!',
        error: 'Error in sending mail'
      }
    ).then((res) => {
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
    const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);

    if (!isEmailValid) {
      toast.error("Invalid Email");
      return;
    }
    toast.info("Sending Email");
    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("title", singalMeet.Title);
      formData.append("eventStartDate", singalMeet.EventStartDateTime);
      formData.append("eventEndDate", singalMeet.EventEndDateTime);
      formData.append("eventLocation", singalMeet.EventLocation);

      const res = await axios.post(
        `${API_URL}/genral/sendMailForPhysical`,
        formData
      );
      if (res.data.errorCode === "1") {
        toast.success("Email Send Successfully");
        setShowEmailPopUp(false);
      } else {
        toast.error("Error in sending mail");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in sending mail");
    }

    // setShowEmailPopUp(false);
  };

  useEffect(() => {
    getMeetingById();
    getSpeaker();
    getPosterById();
  }, []);

  async function getMeetingById() {
    try {
      const res = await axios.get(
        `${API_URL}/physicalMeeting/getPhysicalMeetingByIdWithDateFormat/${id}`
      );
      setSingalMeet(res?.data?.data[0]);
    } catch (error) {
      console.log(error);
    }
  }

  async function getSpeaker() {
    const fkmid = id;

    try {
      const res = await axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);

      // console.log(res,'inside speaker inof')
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

 




    
   

  // working code
  const handelSave = async () => {
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
        //titleClone.style.fontWeight = 'bold'


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
        placeClone.style.fontFamily = `${fontfamily}`;
        // placeClone.style.fontWeight = 'bold'

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
        // sdateClone.style.fontWeight = 'bold'

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
        // edateClone.style.fontWeight = 'bold'

      }


    // for adding speaker

    for (let i = 0; i < speaker.length; i++) {
      const es = ["spkimg", "spkname", "spkqualification"];

      const imgClone = posterClone.querySelector(
        `.${es[0]}${i + 1}${posterId}`
      );

      if (imgClone) {
        const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
        //console.log(imgh, imgw, imgx, imgy);
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
        //nameClone.style.border = "1px solid black"
        // nameClone.style.fontWeight = 'bold'
        nameClone.style.fontFamily = '"Roboto Slab", serif'
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
        // qualificationClone.style.fontWeight = 'bold'
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
        const link = document.createElement("a");
        link.href = imageWithBackground;
        link.download = "poster.png";
        link.click();

        // Clean up the temporary canvas
        canvas.remove();
      };
    };
  };

  // image append child
  // const handelSave = async () => {

  //     if(!posterImage){
  //         toast.error("Please select poster");
  //         return;
  //     }
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
  //         const elementClone = posterClone.querySelector(`.${className}`);
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

  //     console.log("speaker image",speaker[i]);
  //     const es = ["spkimg", "spkname", "spkqualification"];

  // const imageElement = document.createElement("img");

  // // Set attributes for the image element (adjust as needed)
  // imageElement.src = `${API_URL}/uploads/speaker/${speaker[i].SpkImage}`;
  // imageElement.style.position = "absolute"
  // imageElement.crossOrigin = "anonymous";
  // imageElement.style.width = `200px`; // Adjust width as needed
  // imageElement.style.height = `200px`; // Adjust height as needed
  // imageElement.style.top = `20%`; // Adjust width as needed
  // imageElement.style.left = `20%`;

  // // Append the image element to the posterClone
  // posterClone.appendChild(imageElement);

  //         const nameClone = posterClone.querySelector(`.${es[1]}${i+1}`);

  //         if (nameClone) {
  //             const { sny,snx,snf } = spkdata[i];
  //             nameClone.style.position = "absolute";
  //             //nameClone.style.height = `${imgh}px`;
  //            // nameClone.style.width = `${imgw}px`;
  //             nameClone.style.top = `${sny}%`;
  //             nameClone.style.left = `${snx}%`;
  //             nameClone.style.fontSize = `${snf}px`;
  //         }

  //         const qualificationClone = posterClone.querySelector(`.${es[2]}${i+1}`);

  //         if (qualificationClone) {
  //             const { sqy,sqx,sqf } = spkdata[i];
  //             qualificationClone.style.position = "absolute";
  //            // qualificationClone.style.borderRadius = "50%";
  //             //qualificationClone.style.height = `${imgh}px`;
  //             //qualificationClone.style.width = `${imgw}px`;
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
  //         //width: posterImage.width,
  //         //height: posterImage.height,
  //         width:2637,
  //         height:2215
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
  //         const link = document.createElement("a");
  //         link.href = imageWithBackground;
  //         link.download = "poster.png";
  //         link.click();

  //         // Clean up the temporary canvas
  //         canvas.remove();
  //       };
  //     };
  //   };

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
        //titleClone.style.fontWeight = 'bold'

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


    // for adding speaker

    for (let i = 0; i < speaker.length; i++) {
      const es = ["spkimg", "spkname", "spkqualification"];

      const imgClone = posterClone.querySelector(
        `.${es[0]}${i + 1}${posterId}`
      );

      if (imgClone) {
        const { imgh, imgw, imgx, imgy } = speakerFieldData[i];
        //console.log(imgh, imgw, imgx, imgy);
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
      AttendeeUrl: singalMeet.EventLocation,
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
      AttendeeUrl: singalMeet.EventLocation,
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
      AttendeeUrl: singalMeet.EventLocation,
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
      AttendeeUrl: singalMeet.EventLocation,
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
                          <i className="icofont icofont-checked mr-2 "></i>
                          Meeting Title : {singalMeet.Title}
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
                                  <b>Meeting Type: </b> <span className="span-style">Physical Meeting</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Meeting Start Date: </b>{" "}
                                  <span className="span-style">{singalMeet.EventStartDateTime}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Meeting End Date: </b>{" "}
                                  <span className="span-style">{singalMeet.EventEndDateTime}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Meeting Venue: </b>{" "}
                                  <span className="span-style">{singalMeet.EventLocation}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Coordinator Name: </b> <span className="span-style">{singalMeet.Name}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Coordinator Mobile: </b>{" "}
                                   <span className="span-style"> {singalMeet.Mobile}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Client Name: </b> <span className="span-style">{singalMeet.FullName}</span>
                                </div>
                                <div className="m-2 mdetails">
                                  <b>Department Name: </b> <span className="span-style">{singalMeet.DeptName}</span>
                                </div>
                                {/* <div className="m-2">
    <b>Attendence Link: </b> <input name="url"
        type="text" className="form-control"
        value="https://test.com"/>
</div> */}
                                <div className="mdetails">
                                  
                                  
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
                                      onClick={() => handelSave(1)}
                                      className="btn btn-grd-success hor-grd btn-icon waves-effect waves-light ml-2"
                                      data-toggle="tooltip" data-placement="top"
                                      title="Download Poster">
                                      <i className="icofont icofont-download-alt mr-4"></i>
                                      </button>


                                 

                               

                                    <button type="button" 
                                    onClick={handelSave1}
                                    className="btn btn-danger hor-grd btn-icon waves-effect waves-light ml-2"
                                    data-toggle="tooltip" data-placement="top"
                                    title="Send Email">
                                     <i className="icofont icofont-envelope mr-4"></i>
                                    </button>
                                 

                                  <div className="dropdown ml-2">
                                  <button type="button" 
                                     onClick={handleButtonClick}
                                    className="btn btn-grd-warning hor-grd btn-icon waves-effect waves-light"
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
                                      {singalMeet.Title}
                                    </div>
                                    <div className={`div-place${posterId}`}>
                                      {singalMeet.EventLocation}
                                    </div>

                                    <div className={`div-sdate${posterId}`}>
                                      {singalMeet.EventDate}
                                    </div>
                                    <div className={`div-edate${posterId}`}>
                                      {singalMeet.EventTime}
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
                             
                            </div>
                          </div>
                        </div>
                        
                        {speaker.length == 0 ? "":(
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
                        </div>
                        )}
                        
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
                    
                       handelSendEmail
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
    </div>
  );
};

export default MeetingDetails;
