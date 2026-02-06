import ConfirmationPopup from "../popup/Popup";

//import { toast } from 'react-toastify';
import "./employee.css"

//import 'react-toastify/dist/ReactToastify.css';
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { BASEURL } from "../constant/constant";
function EditModel({setEditUserModel,empData,getfun}){
  
  //const userId = sessionStorage.getItem('userId');
  const [name,setName]= useState(empData.name);
  const [empcode,setEmpcode]= useState(empData.empcode);
  //const [statee,setStatee]= useState(empData.state);
  const [hq,setHq]= useState(empData.hq);
  //const [citye,setCitye]= useState(empData.city);
 // const [pincodee,setPincodee]= useState(empData.pincode);
 //const [designatione, setDesignatione] = useState(empData.designation)
  //const [reportinge,setReportinge]= useState(empData.reporting);
  const [password,setPassword]= useState(empData.password);
  //const [rolee,setRolee]= useState(empData.role);

  const [showConfirmation, setShowConfirmation] = useState(false);
  
  //console.log("inside editmode", setEditUserModel,empData,getfun)
  const handelCloseModel=()=>{
    setEditUserModel(false)
  }

  const handleSubmit = async(e)=>{
    e.preventDefault();
    //console.log("required field",name,empcode,statee,hq)
    //console.log("reporting",typeof(reporting))
    if (!name|| 
      !empcode || 
      // !statee || 
       !hq || 
      // !designatione || 
      !password 
      //!rolee
    ) {
        toast.error("Missing required fields");
        return;
      }
      setShowConfirmation(true);
   
}

  const handleConfirm = async (id) => {

    console.log("isndie onconform",id);

    setShowConfirmation(false);
    setEditUserModel(false)
    try {
        const res = await axios.patch(`${BASEURL}/admin/updateEmpWithId/${id}`,{name,empcode,hq,password});
        if(res?.data?.errorCode === "1"){

          toast.success("Employee Updated successfully");
          getfun();
        }
        else{
          toast.error("Error in Employee Updated")
        }
    } catch (error) {
      console.log(error)
       toast.error(error.message) 
    }
   
    setName("")
    setEmpcode("")
    setHq("")
    //setDesignatione("")
    //setReportinge("")
    setPassword("") 
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };
  return (
    <div className="addusermodel">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header" style={{ backgroundColor: '#10387a', color: '#fff' }}>
            <h5 className="modal-title">Edit Employee</h5>
            <button  onClick ={handelCloseModel}type="button" className="close-but">
              <span >&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="inputName4">Name Of Employee</label>
                  <input type="text" value ={name} onChange={(e)=>{
                      setName(e.target.value)
                  }} 
                  className="form-control" id="inputName4" name="name" placeholder="Name"  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="Code">Employee Code</label>
                  <input type="number" value ={empcode}  onChange={(e)=>{
                      setEmpcode(e.target.value)
                  }}
                  className="form-control" id="Code" name="code" placeholder="Code"  />
                </div>
                {/* <div className="form-group col-md-6">
                  <label htmlFor="state">State</label>
                  <input type="text" value ={statee}  onChange={(e)=>{
                      setStatee(e.target.value)
                  }}
                   className="form-control" id="state" name="state" placeholder="State"  />
                </div> */}
              
                <div className="form-group col-md-6">
                  <label htmlFor="HQ">HQ</label>
                  <input type="text" value ={hq} 
                  onChange={(e)=>{
                    setHq(e.target.value)
                }}
                 className="form-control" id="HQ" name="hq" placeholder="HQ"  />
                </div>
                {/* <div className="form-group col-md-6">
                  <label htmlFor="designation">Designation</label>
                  <select
                        id="inputState"
                        onChange={(e) => {
                          setDesignatione(e.target.value);
                        }}
                        className="form-control"
                        name="designation"
                        value={designatione}
                      >
                        
                        <option value="ZBM">ZBM</option>
                        <option value="RBM">RBM</option>
                        <option value="ABM">ABM</option>
                        <option value="TM">TM</option>
 
                      </select>
                </div> */}
                {/* <div className="form-group col-md-6">
                  <label htmlFor="reporting">Reporting</label>
                  <input type="number" value ={reportinge} onChange={(e)=>{
                      setReportinge(e.target.value)
                  }}
                  className="form-control" id="reporting" name="reporting" placeholder="Employee Code"  />
                </div> */}
               
                <div className="form-group col-md-6">
                  <label htmlFor="password">Password</label>
                  <input type="text" value ={password}  onChange={(e)=>{
                      setPassword(e.target.value)
                  }}
                  className="form-control" id="password" name="password" placeholder="Password"  />
                </div>
              </div>
              <div className="text-center">
                <button type="submit" className="btn btn-primary mx-auto">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    {showConfirmation && (
          <ConfirmationPopup
            message="Are you sure you want to Edit Employee?"
            onConfirm={() => handleConfirm(empData.user_id)}
            onCancel={handleCancel}
          />
        )}
    </div>
  )
}

export default EditModel;