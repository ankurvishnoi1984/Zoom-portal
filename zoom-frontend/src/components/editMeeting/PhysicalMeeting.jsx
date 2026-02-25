import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { API_URL } from '../../utils/constant';

import './PhysicalMeeting.css'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../utils/Loader';
import ConfirmationPopup from '../popup/Popup';
import { LoginContext } from '../../context/LoginContext';
  const ModernInput = ({ label, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full h-11 px-4 rounded-xl
                 !border !border-blue-300 !bg-white
                 placeholder-gray-400
                 focus:!outline-none
                 focus:!ring-2 focus:!ring-blue-500/40
                 focus:!border-blue-500
                 hover:!border-blue-400
                 transition-all duration-200"
      />
    </div>
  );

const EditPhysicalMeeting = () => {

  const navigate = useNavigate();
  const [loader, setLoader] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(1)

  const [getSingleMeeting, setGetSingleMeeting] = useState({})
  const [title, setTitle] = useState('');
  const [sdate, setSDate] = useState('');
  const [edate, setEDate] = useState('');
  const [venue, setVenue] = useState('');


  const [cname, setCname] = useState('');
  const [cmobile, setCmobile] = useState('');

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isEditPopUpOpen, setIsEditPopUpOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { id } = useParams();

  // for speaker 

  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');


  const [imageName, setImageName] = useState('')
  const [image1, setImage1] = useState('');
  const [name1, setName1] = useState('');
  const [qualification1, setQualification1] = useState('');
  const [line11, setLine11] = useState('');
  const [line21, setLine21] = useState('');
  const [line31, setLine31] = useState('');
  const [sid, setSid] = useState('')

  const [allSpeaker, setSpeaker] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [speakerId, setSpekerId] = useState(null);
  const [speakerImage, setSpeakerImage] = useState("");
  const [wcid, setWcid] = useState('')
  const [deptId, setDeptId] = useState('')
  const [clientId, setClientId] = useState('')

  // fro poster image 
  //const [clientId,setClientId] = useState(20042);
  //const [depid, setDepId] = useState(34);
  const [posteList, setPosterList] = useState([]);
  const [selectedPoster, setSelectedPoster] = useState('')
  const [posterSelect, setPosterSelect] = useState('')
  const [posterid, setPosterId] = useState(0);


  async function getPoster() {
    const spkCount = allSpeaker.length;
    try {
      const res = await axios.post(`${API_URL}/poster/getPoster`, { deptId, clientId, spkCount });
      if (res.data.errorCode === "1") {

        setPosterList(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handelPosterSelect = (postename, posterId) => {

    console.log("fdsfds", postename, posterId)
    setPosterSelect(postename)
    setPosterId(posterId)
  }

  async function EditPoster() {

    try {
      const res = await axios.patch(`${API_URL}/poster/updatePosterById/${id}`, { pname: posterSelect, fkpid: posterid, fkwcid: wcid });
      if (res.data.errorCode === "1") {
        //alert("Poster Updated")
        navigate('/dashboard')
        //    alert("poster updated")

      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getPoster();
  }, [allSpeaker, clientId])


  const handelSubmit = async () => {

    if (!posterSelect) {
      toast.error("Please select poster")
      return;
    }
    if (posterSelect) {

      await EditPoster();
      navigate('/dashboard')
    }


  }




  const handelAddSpeaker = async () => {

    if (!image || !name || !qualification) {
      toast.error('Missing required field');
      return;
    }
    setLoader(true)
    const formData = new FormData();

    formData.append('image', image);
    formData.append('name', name);
    formData.append('qualification', qualification);
    formData.append('line1', line1);
    formData.append('line2', line2);
    formData.append('line3', line3);
    formData.append('fkmid', id);
    formData.append('fkwcid', wcid);


    try {
      const res = await axios.post(`${API_URL}/speaker/addSpeaker`, formData);
      console.log(res)
      if (res.data.errorCode === "1") {
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

  const handelSpekerDelete = async (id, imgname) => {
    setSpekerId(id);
    setSpeakerImage(imgname);
    setShowConfirmation(true)


  }

  const handleConfirm = async () => {
    setShowConfirmation(false);
    const id = speakerId;
    try {
      setLoader(true)
      const res = await axios.patch(
        `${API_URL}/speaker/deleteSpeaker/${id}`, { imgname: speakerImage }
      );
      if (res.data.errorCode == "1") {
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

  console.log("image name", imageName)
  const handelSpeakerUpdate = async (id) => {

    setLoader(true)
    const formData = new FormData();

    formData.append('image', image1);
    formData.append('name', name1);
    formData.append('qualification', qualification1);
    formData.append('line1', line11);
    formData.append('line2', line21);
    formData.append('line3', line31);
    formData.append('imgname', imageName);


    try {
      const res = await axios.patch(`${API_URL}/speaker/updateSpeaker/${id}`,
        formData
      );



      if (res.data.errorCode == "1") {
        getSpeaker()
        setIsEditPopUpOpen(false)
      }
    } catch (error) {
      console.log(error)
    }
    setLoader(false)
  }


  async function getSpeaker() {

    const fkmid = id;

    try {
      const res = await axios.get(`${API_URL}/speaker/getSpeaker/${fkmid}`);

      console.log(res, "inside getspeaker")

      if (res.data.errorCode == "1") {
        setSpeaker(res.data.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function getSpeakerById(id) {
    try {
      setLoader(true)
      const res = await axios.get(`${API_URL}/speaker/getSpeakerById/${id}`);

      console.log(res)

      if (res.data.errorCode == "1") {

        const sdata = res?.data?.data[0]

        setImage1('')
        setImageName(sdata.SpkImage)
        setName1(sdata.SpkName)
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


  useEffect(() => {
    getSpeaker()
  }, [])


  //console.log("title",date)
  const handelShowPreview = (postername) => {
    setIsPreviewOpen(true)
    setSelectedPoster(postername)
  }

  const handelSetPopUp = () => {
    setIsPopUpOpen(true)
  }

  const handelSetEditPopUp = (id) => {
    setIsEditPopUpOpen(true)
    getSpeakerById(id)
  }

  const handelClosePopup = () => {
    setIsPopUpOpen(false)
  }

  const handelCloseEditPopup = () => {
    setIsEditPopUpOpen(false)
  }

  const handelClosePreviewPopup = () => {
    setIsPreviewOpen(false)
  }

  const handelIndexChange = (value) => {
    setCurrentIndex(value)
  }
  const handelIndexChange1 = (value) => {
    if (allSpeaker.length <= 0) {
      toast.error("Please add speaker");
      return;
    }
    setCurrentIndex(value)
  }


  const handelPhysicalMeetUpdate = async () => {

    try {
      setLoader(true);
      const res = await axios.patch(`${API_URL}/physicalMeeting/updatePhysicalMeeting/${id}`, { title, sdate, edate, cname, cmobile, venue });
      if (res.data.errorCode == "1") {
        setLoader(false)
        toast.success("Updated Physical Meeting")
      }
    } catch (error) {
      setLoader(false)
      console.log(error)
    }
  }

  useEffect(() => {
    getMeetingById()
  }, [])




  async function getMeetingById() {
    setLoader(true)
    try {
      const res = await axios.get(`${API_URL}/physicalMeeting/getPhysicalMeetingById/${id}`);
      setGetSingleMeeting(res?.data?.data[0]);
      const obj = res?.data?.data[0];
      setTitle(obj.Title)
      setSDate(obj.EventStartDateTime.substring(0, 16));
      setEDate(obj.EventEndDateTime.substring(0, 16))
      setCmobile(obj.Mobile);
      setCname(obj.Name);
      setVenue(obj.EventLocation)
      setWcid(obj.WcId)
      setClientId(obj.ClientCode);
      setDeptId(obj.DeptId)
    } catch (error) {
      console.log(error)
    }
    setLoader(false)
  }



  return loader ? <Loader /> : (
    <div>
      <div className="pcoded-content">
        <div className="pcoded-inner-content">
          <div className="main-body">
            <div className="page-wrapper">

              <div className="page-body">
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm !border !border-gray-200">
                  <div className="px-8 py-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Update Physical Meeting
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Edit meeting details
                    </p>
                  </div>

                  <div className="p-4">

                    <div className="row ">
                      <div className="col-lg-12 col-xl-12">



                        <div className="flex flex-wrap gap-2 mb-8">
                          {[
                            { id: 1, label: "Meeting Details" },
                            { id: 2, label: "Speaker Details" },
                            { id: 3, label: "Select Template" },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handelIndexChange(tab.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition
        ${currentIndex === tab.id
                                  ? "bg-blue-600 text-white shadow"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="tab-content card-block">

                          {currentIndex == 1 ? (
                            <div className="tab-pane active" id="home7" role="tabpanel">
                              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">

                                {/* Meeting Title */}
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

                                {/* Start Date */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting Start Date
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={sdate}
                                    onChange={(e) => setSDate(e.target.value)}
                                    className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                {/* End Date */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Meeting End Date
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={edate}
                                    onChange={(e) => setEDate(e.target.value)}
                                    className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                {/* Venue */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Venue
                                  </label>
                                  <input
                                    type="text"
                                    value={venue}
                                    onChange={(e) => setVenue(e.target.value)}
                                    className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                {/* Coordinator Name */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Coordinator Name
                                  </label>
                                  <input
                                    type="text"
                                    value={cname}
                                    onChange={(e) => setCname(e.target.value)}
                                    className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                {/* Coordinator Mobile */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Coordinator Mobile
                                  </label>
                                  <input
                                    type="number"
                                    value={cmobile}
                                    onChange={(e) => setCmobile(e.target.value)}
                                    className="w-full h-11 rounded-lg !border !border-blue-200 px-3
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                              </div>

                              <div className="flex justify-end mt-8">
                                <button
                                  onClick={() => {
                                    handelPhysicalMeetUpdate();
                                    handelIndexChange(2);
                                  }}
                                  className="px-6 h-11 rounded-lg bg-blue-600 text-white font-semibold
               shadow-sm hover:bg-blue-700 transition active:scale-[0.98]"
                                >
                                  Next →
                                </button>
                              </div>

                            </div>
                          ) : currentIndex == 2 ? (
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
                                      {/* Left: Image + Info */}
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

                                      {/* Right: Actions */}
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
                                          onClick={() =>
                                            handelSpekerDelete(e.Id, e.SpkImage)
                                          }
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
                                  onClick={() => handelIndexChange1(3)}
                                  className="px-5 py-2 rounded-lg
                                                                                                                                                     bg-blue-600 hover:bg-blue-700
                                                                                                                                                     text-white font-semibold shadow transition"
                                >
                                  Next →
                                </button>
                              </div>

                            </div>
                          ) : currentIndex == 3 ? (
                            <div className="tab-pane active">
                              {/* Grid */}
                              <form action="" id="Test &amp; Survey" method="post"
                                className="card tabcontent" style={{ display: 'block' }}>
                                <div className="row row-cards row-deck">
                                  {posteList && posteList.length > 0 && posteList.map((e) => (

                                    <div key={e.poster_id} className="col-sm-6 col-xl-4">
                                      <div className="card">
                                        <div className="containerc">
                                          <img
                                            crossOrigin="anonymous"
                                            src={`${API_URL}/uploads/poster/${e.poster_name}`}
                                            alt="" className="imgposter" />

                                          <div className="overlay">
                                            <div className="text"><button
                                              onClick={() => handelShowPreview(e.poster_name)}
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
                                          onClick={() => handelPosterSelect(e.poster_name, e.poster_id)}
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
                          ) : ""}




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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
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
              <ModernInput
                label="Speaker Name"
                placeholder="Enter speaker name"
                onChange={(e) => setName(e.target.value)}
              />

              <ModernInput
                label="Speaker Qualification"
                placeholder="Enter qualification"
                onChange={(e) => setQualification(e.target.value)}
              />

              <ModernInput
                label="Speaker Bios Line 1"
                placeholder="Enter bio line"
                onChange={(e) => setLine1(e.target.value)}
              />

              <ModernInput
                label="Speaker Bios Line 2"
                placeholder="Enter bio line"
                onChange={(e) => setLine2(e.target.value)}
              />

              <ModernInput
                label="Speaker Bios Line 3"
                placeholder="Enter bio line"
                onChange={(e) => setLine3(e.target.value)}
              />
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

              {/* Modern Input helper */}
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
                                      !border !border-blue-300 bg-white
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



    </div>
  )
}

export default EditPhysicalMeeting