import ConfirmationPopup from "../popup/Popup";
import "./group.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASEURL} from "../constant/constant";
import toast from "react-hot-toast";


function EditModel({ setEditUserModel, empData, getfun }) {

  const [name, setName] = useState(empData.DeptName);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handelCloseModel = () => {
    setEditUserModel(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !name
    ) {
      toast.error("Please Enter Name");
      return;
    }
   
    setShowConfirmation(true);
  };

  const handleConfirm = async (id) => {
   
    setShowConfirmation(false);
    setEditUserModel(false);
    try {
      const res = await axios.post(`${BASEURL}/auth/updateDepartmentWithId`, {
        name,
        departmentId:id,
      });
      if (res?.data?.errorCode === "1") {
        toast.success("DepartMent Updated successfully");
         await getfun();
      } else {
        toast.warn("Error in User Updating");
      }
    } catch (error) {
      toast.warn(error.message);
    } 
    setName("");
     
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
            <h5 className="modal-title">Edit Department</h5>
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
                    <div className="form-group col-md-12">
                      <label htmlFor="inputName4">Department Name</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                        className="form-control"
                        value={name}
                        placeholder="Name"
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
          message="Are you sure you want to Edit Department?"
          onConfirm={() => handleConfirm(empData.DeptId)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default EditModel;
