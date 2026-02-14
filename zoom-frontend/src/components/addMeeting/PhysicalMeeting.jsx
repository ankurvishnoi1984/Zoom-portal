import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { API_URL } from '../../utils/constant';

import './PhysicalMeeting.css'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Loader from '../../utils/Loader';
import ConfirmationPopup from '../popup/Popup';
import { LoginContext } from '../../context/LoginContext';

const PhysicalMeeting = () => {
   
    const navigate = useNavigate();
    const [loader, setLoader] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(1)

    const [title,setTitle] = useState('');
    const [sdate, setSDate] = useState('');
    const [edate, setEDate] = useState('');
    const [venue, setVenue] = useState('');

    
 
    const [cname, setCname] = useState('');
    const [cmobile,setCmobile] = useState('');

    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // for speaker 

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
    const [fkmid, setfkmid] = useState('')
    const [fkwcid, setfkwcid] = useState('')

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [speakerId, setSpekerId] = useState(null);
    const [speakerImage, setSpeakerImage]= useState("");

    // fro poster image 
    //const [clientId,setClientId] = useState(20042);
    //const [depid, setDepId] = useState(34);
    const [posteList, setPosterList] = useState([]);
    const [selectedPoster, setSelectedPoster] = useState('')
    const [posterSelect, setPosterSelect] = useState('')
    const [posterid,setPosterId] = useState(0);

    const {deptId,clientId} = useContext(LoginContext)
    const userId = sessionStorage.getItem("userId")
    
    console.log("yyyyyyyyyyyyyyyyyy", deptId,clientId)
   // console.log("all speaker",allSpeaker)

   async function getPoster(){
         const spkCount = allSpeaker.length;
         if(spkCount>4){
            alert("Poster not found Please remove one or more speaker")
            return;
         }
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
      
        //console.log(posterId,postename)
        setPosterSelect(postename)
        setPosterId(posterId)

    }

    async function AddPoster(){

        try {
            const res = await axios.post(`${API_URL}/poster/addPoster`,{pname:posterSelect,fkmid,fkwcid,fkpid:posterid});
            if(res.data.errorCode==="1"){
                
                navigate("/dashboard")
               //alert("poster added")
            }
        } catch (error) {
           console.log(error) 
        }
    }

    useEffect(()=>{
        getPoster();
    },[allSpeaker])

  
    const handelSubmit = ()=>{
        if(!posterSelect){
            toast.error("Please select poster")
            return;
        }
       // console.log(posterSelect,fkmid)
        AddPoster()
    }

    const handelAddSpeaker = async()=>{

        if(!image || !name || ! qualification){
            toast.error('Missing required field');
            return;
        }
        setLoader(true);
        const formData = new FormData();

        formData.append('image',image);
        formData.append('name',name);
        formData.append('qualification',qualification);
        formData.append('line1',line1);
        formData.append('line2',line2);
        formData.append('line3',line3);
        formData.append('fkmid',fkmid);
        formData.append('fkwcid',fkwcid);

    

       try {
          const res = await axios.post(`${API_URL}/speaker/addSpeaker`,formData);
         // console.log(res)
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
           setShowConfirmation(true)

        // try {
        //     const res = await axios.patch(
        //       `${API_URL}/speaker/deleteSpeaker/${id}`,{imgname}
        //     );
        //     if(res.data.errorCode=="1"){
        //       toast.success("Speaker Delete Successfully")
        //      }
        //      getSpeaker();
           
        //   } catch (error) {
        //     console.log(error);
        //   }
    }

    const handleConfirm = async()=>{
        setShowConfirmation(false);
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

    const handleCancel = () => {
        setShowConfirmation(false);
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

        if(!fkmid){
            return;
        }

        try {
          const res  = await  axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);

         
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

         // console.log(res)
  
           if(res.data.errorCode=="1"){

            const sdata = res?.data?.data[0]
            
            
            setImage1('')
            setName1(sdata.SpkName)
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
            console.log(error)
            setLoader(false)
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

    const handelSetEditPopUp = async(id)=>{
        setIsEditPopUpOpen(true)

      console.log("inside speaker edit",id)
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
     
  
    const handelPhycialMeet = async()=>{

        if(!title || !sdate || !edate || !cname  || !cmobile ||!venue){
            toast.error('Missing required field');
            return;
        }
          setLoader(true)
        try {
          const res  = await  axios.post(`${API_URL}/physicalMeeting/createMeeting`, {title,sdate,edate,cname,cmobile,venue,deptId,clientId,userId});
             
           if(res.data.errorCode=="1"){
            setfkmid(res.data.pmid)
            setfkwcid(res.data.wcid)

            setCurrentIndex(2)
            setLoader(false)
            toast.success("Added Physical Meeting")
           }
           else{
             toast.error("Error in adding physical meeting")
           }
        } catch (error) {
            console.log(error)
            setLoader(false)
        }
        setLoader(false)
        setTitle("");
        setSDate("");
        setEDate("");
        setCname("");
        setCmobile("");
        setVenue("")
    }

   

  return loader ? <Loader/> :(
    <div>
        <div className="pcoded-content">
                            <div className="pcoded-inner-content">
                                <div className="main-body">
                                    <div className="page-wrapper">

                                        <div className="page-body">
                                            <div className="card container">
                                                <div className="card-header">
                                                    <h5>Add Physical Meeting</h5>


                                                </div>
                                                <div className="card-block tbstyle  tab-icon">
                                                   
                                                    <div className="row ">
                                                        <div className="col-lg-12 col-xl-12">
                                                           
                                                            <div className="sub-title">Fill all details</div>
                                                           
                                                            <ul className="nav nav-tabs md-tabs">
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
                                                                            className="icofont icofont-ui-user"></i>Speaker
                                                                        Details</a>
                                                                    <div className="slide"></div>
                                                                </div>
                                                                <div className="nav-item fw-bolder" onClick={()=>handelIndexChange(3)}>
                                                                    <a className={`nav-link ${currentIndex===3 ?'active':""}`} ><i
                                                                            className="icofont icofont-ui-file"></i>Select
                                                                        Template</a>
                                                                    <div className="slide"></div>
                                                                </div>
                                                            </ul>
                                                         
                                                            <div className="tab-content card-block">

                                                                {currentIndex== 1 ? (<div className="active">
                                                                    <form  className="mx-auto ">
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label ">Meeting
                                                                                Title</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="text" className="form-control" onChange={(e)=>{
                                                                                    setTitle(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                Start Date</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="datetime-local" className="form-control" onChange={(e)=>{
                                                                                    setSDate(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                End Date</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="datetime-local" className="form-control" onChange={(e)=>{
                                                                                    setEDate(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">
                                                                                Venue</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="text" className="form-control" onChange={(e)=>{
                                                                                    setVenue(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        {/* <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Meeting
                                                                                Ending Time</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="time" className="form-control" onChange={(e)=>{
                                                                                    setEtime(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div> */}
                                                                        <div className="form-group row container mx-auto">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Coordinator
                                                                                Name</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="text" className="form-control" onChange={(e)=>{
                                                                                    setCname(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>
                                                                        <div className="form-group row container mx-auto ">
                                                                            <label
                                                                                className="col-sm-4 col-form-label">Coordinator
                                                                                Mobile No.</label>
                                                                            <div className="col-sm-8">
                                                                                <input type="number" className="form-control"  pattern="[0-9]{10}" maxLength="10" onChange={(e)=>{
                                                                                    setCmobile(e.target.value)
                                                                                }}/>
                                                                            </div>
                                                                        </div>

                                                                    
                                                                    </form>
                                                                        <div className="text-right">
                                                                            <button className="btn hor-grd btn-grd-primary"
                                                                                onClick={handelPhycialMeet}
                                                                          >Next</button>       
                                                                        </div>

                                                                </div>): currentIndex==2 ? (<div className="active">
                                                                    <ul className="show-notification"
                                                                        style={{display:'block'}}>
                                                                        <div className="text-center m-3">
                                                                            <button className="btn btn-grd-primary"
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
                                                                                            className="card-block remove-label">
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
                                                                           
                                                                            onClick={()=>handelIndexChange(1)}
                                                                           >

                                                                            Previous</button>
                                                                        <button
                                                                            className="btn hor-grd btn-grd-primary float-right"
                                                                           
                                                                            onClick={()=>handelIndexChange1(3)}
                                                                          >

                                                                            Next</button>
                                                                    </div>
                                                                </div>):currentIndex== 3 ?(<div className="active">
                                                                    <form 
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

                                                                </div>):""}
                                                                

                                                                
                                                                
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

                        {showConfirmation && (
              <ConfirmationPopup
                message="Are you sure you want to Delete Speaker?"
                onConfirm={() => handleConfirm()}
                onCancel={handleCancel}
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
                                {/* <div className="col-md-8 col-lg-8">
                                    <div className="form-group">
                                        <input type="file" className="form-control" 
                                        onChange={(e)=>{
                                        
                                          setImage(e.target.files[0])  
                                        }}
                                        />
                                    </div>
                                </div> */}
                                
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
            


    </div>
  )
}

export default PhysicalMeeting