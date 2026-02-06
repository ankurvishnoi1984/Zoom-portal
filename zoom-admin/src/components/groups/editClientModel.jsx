import ConfirmationPopup from "../popup/Popup";
import "./group.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASEURL} from "../constant/constant";
import toast from "react-hot-toast";


function EditClientModel({ setEditUserModel, empData, getfun }) {

  const [clientName,setClientName] = useState(empData.FullName);
  const [contactNumber, setContactNumber]= useState(empData.ContactNumber);
  const [contactPerson,setContactPerson] = useState(empData.ContactPerson)
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handelCloseModel = () => {
    setEditUserModel(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !contactNumber ||
      !contactPerson ||
      !clientName
    ) {
      toast.error("Please enter required field");
      return;
    }
   
    setShowConfirmation(true);
  };

  const handleConfirm = async (id) => {
   
    setShowConfirmation(false);
    setEditUserModel(false);
    try {
      const res = await axios.post(`${BASEURL}/auth/updateClientWithId`, {
      contactNumber, 
      contactPerson,
      clientName,
      clientId:id,
      });
      if (res?.data?.errorCode === "1") {
        toast.success("Client Updated successfully");
         await getfun();
      } else {
        toast.warn("Error in Client Updating");
      }
    } catch (error) {
      toast.warn(error.message);
    } 
    setClientName('');
    setContactNumber('');
    setContactPerson('');
     
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };



  return (
    <div className="addusermodel">
      <div className="modal-dialog">
        <div className="modal-content">
          <div
            className="modal-header show-box"
            
          >
            <h5 className="modal-title">Edit Client</h5>
            <button
              onClick={handelCloseModel}
              type="button"
              className="close-but"
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
            <div className="form-row">
                    <div className="form-group col-md-6">
                      <label htmlFor="inputName4">Client Name</label>
                      <input type="text" className="form-control d-block" 
                      placeholder="Client Name"
                   onChange={(e) => {
                    setClientName(e.target.value);
                  }}
                  value={clientName}
                  />  
                    </div>
                    <div className="form-group col-md-6">
                      <label htmlFor="inputName4">Contact Person</label>
                      <input type="text" className="form-control d-block" 
                  placeholder="Contact Person"
                  onChange={(e) => {
                    setContactPerson(e.target.value);
                  }}
                  value={contactPerson}
                  />   
                    </div>
                    <div className="form-group col-md-6">
                      <label htmlFor="inputName4">Contact Number</label>
                      <input type="text" className="form-control d-block" 
                      placeholder="Contact Number"
                     maxLength={10}
                     onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      setContactNumber(e.target.value);
                    }
                  }}
                  value={contactNumber}
                  /> 
                    </div>
                  </div>
              <div className="text-center">
                <button type="submit" className="btn btn-primary mx-auto">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationPopup
          message="Are you sure you want to Edit Client?"
          onConfirm={() => handleConfirm(empData.ClientCode)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default EditClientModel;
