import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL} from "../constant/constant";
import "./group.css";
import ConfirmationPopup from "../popup/Popup";
import EditModel from "./editGroupModel";
import toast from "react-hot-toast";
import EditClientModel from "./editClientModel";
import Loader from "../utils/Loader";
function Group() {
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmationDel, setShowConfirmationDel] = useState(false);
  const [delId, setDelId] = useState(null);

  const [addUserModel, setAddUserModel] = useState(false);
  const [editUserModel, setEditUserModel] = useState(false);
  const [editClientModel, setEditClientModel] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);


  // for group adding 
  const [showGroupModel, setGroupModel] = useState(false);
  const [delGroupId, setDelGroupId] = useState('');
  const [showConfirmationGroupDel, setShowConfirmationGroupDel] = useState(false);
 

  /////////////
  const [clientList,setClientList] = useState([]);
  const [departmentList,setDepartmentList] = useState([]);
  const [clientId,setClientId] = useState('');
  const [clientId1,setClientId1] = useState('');

  const [clientName, setClientName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber,setContactNumber] = useState('')

  const [departmentName, setDepartmentName] = useState('');
  const [singalDeprtment, setSingalDepartment] = useState({});
  const [singalClient, setSingalClient] = useState({});

  const [loader,setLoading] = useState(false);

  const handelAddUser = () => {
    setAddUserModel(true);
  };

  const handelCreateGroup = () => {
    setGroupModel(true);
  };

  const handelCloseGroupModel = () => {
    setGroupModel(false);
  };

  const handleGroupSubmit = async(e)=>{
       e.preventDefault();
      if(!clientName || !contactPerson || !contactNumber){
        toast.error("Please fill all required field");
        return;
      }
      try {
        const res = await axios.post(`${BASEURL}/auth/addClient`,{
          clientName,
          contactPerson,
          contactNumber
        });
         if(res.data.errorCode==1){
          toast.success('Client added successfully')
          setGroupModel(false);
          getAllClient();
          setClientName('');
          setContactPerson('');
          setContactNumber('');
         }
      } catch (error) {
        console.log(error);
      }
  }
  
  // fro delete group
  const handelClientDelete = async (id) => {
     setDelGroupId(id);
     setShowConfirmationGroupDel(true);
  };
  const handleConfirmGroupDel = async () => {
    setShowConfirmationGroupDel(false);
    try {
      const res = await axios.post(`${BASEURL}/auth/deleteClient`, {clientId:delGroupId});

      if (res.data.errorCode == "1") {
        toast.success("Client Deleted successfully");
         getAllClient();
      } else {
        toast.error(`Failed to delete group with ID ${delGroupId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancelGroupDel = () => {
    setShowConfirmationGroupDel(false);
  };

 
  

  const handelEdit = async (id) => {
    
    const dept = departmentList.find((dep)=> dep.DeptId == id);
    if(dept){
      setSingalDepartment(dept);
    }
    setEditUserModel(true);
  };
   
  const handelClientEdit = async (id) => {
    
    const client = clientList.find((client)=> client.ClientCode == id);
    if(client){
      setSingalClient(client);
    }
    setEditClientModel(true);
  };

  const handelDelete = async (id) => {
    setDelId(id);
    setShowConfirmationDel(true);
  };
  const handleConfirmDel = async () => {
    setShowConfirmationDel(false);
    try {
      const res = await axios.post(`${BASEURL}/auth/deleteDepartment`, {departmentId:delId});

      if (res.data.errorCode == "1") {
        toast.success("Department Deleted successfully");
        await getDepartmentList();
      } else {
        toast.error(`Failed to delete department with ID ${delId}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCancelDel = () => {
    setShowConfirmationDel(false);
  };

  const handelCloseModel = () => {
    setAddUserModel(false);
    setEditUserModel(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !departmentName ||
      !clientId1
    ) {
      toast.error("Missing required fields");
      return;
    }
  
    setShowConfirmation(true);
  };
  const handleConfirm = async () => {
    setShowConfirmation(false);
    setAddUserModel(false);
    try {
      const res = await axios.post(`${BASEURL}/auth/addDepartment`, {
        departmentName,
        clientId:clientId1
      });
      if (res.data.errorCode == 1) {
        toast.success("Department created successfully");
        await getDepartmentList();
      }
    } catch (error) {
      console.log(error);
    }

    setDepartmentName('');
    setClientId1('');
   
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handelNext = () => {
    if (currentPage * entriesPerPage < totalCount) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const handelPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  // pagination logic
  const entriesPerPage = 20;
  const startingEntry = (currentPage - 1) * entriesPerPage + 1;
  const endingEntry = Math.min(startingEntry + entriesPerPage - 1, totalCount);


const getAllClient = async()=>{
      try {
          const res = await axios.get(`${BASEURL}/auth/getClient?searchName=${searchQuery}`);
          if(res.data.errorCode ==1){
            setClientList(res.data.data);
          }
      } catch (error) {
        console.log(error)  
      }
  }
  const getDepartmentList = async()=>{
     setLoading(true)
    try {
        const res = await axios.post(`${BASEURL}/auth/getDepartment`,{clientId});
        if(res.data.errorCode ==1){
          setDepartmentList(res.data.data);
        }
    } catch (error) {
      console.log(error)  
    }
    finally{
      setLoading(false);
    }
}

  useEffect(()=>{
    getAllClient();
  },[searchQuery])

  useEffect(()=>{
    getDepartmentList();
  },[clientId])

  const [openClientId, setOpenClientId] = useState(null);

  const toggleAccordion = (clientId) => {
    setClientId(clientId)
    setOpenClientId(openClientId === clientId ? null : clientId);

  }
  return loader ? <Loader/>:(
    <div className="container-fluid">
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <form className="d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-light border-1 small"
              onChange={handleSearchChange}
              placeholder="Search for..."
              aria-label="Search"
              aria-describedby="basic-addon2"
            />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button">
                <i className="fas fa-search fa-sm"></i>
              </button>
            </div>
            <div className="input-group">
          {/* Dropdown items go here */}
          {/* <select
            className="form-control selectStyle ml-2 search-b"
           onChange={(e)=>{
             setClientId(e.target.value)
           }}
           value={clientId}
          >
            <option value="">Select Client</option> 
        {clientList.length>0 && clientList.map((client)=>(
          <option key={client.ClientCode} value={client.ClientCode}>{client.FullName}</option>
        ))} 
          </select> */}
        </div>
          </div>
          
        </form>
        {/* <button
          className="btn btn-primary btn-icon-split mt-3 mr-2"
          onClick={handelAddUser}
        >
          <span className="icon text-white-50">
            <i className="fas fa-plus"></i>
          </span>
          <span className="text">Add Department</span>
        </button> */}

        <button
          className="btn btn-primary btn-icon-split mt-3"
          onClick={handelCreateGroup}
        >
          <span className="icon text-white-50">
            <i className="fas fa-plus"></i>
          </span>
          <span className="text">Add Client</span>
        </button>
      </div>
      {/* Content Row */}
      <div className="card shadow mb-4">
        <div className="card-body">
        <small className="msgnote mt-2">*Scroll left for other column of table</small>
          <div className="table-responsive">
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
            >
              <thead>
              <tr>
                            <th>Client Name</th>
                            <th>Contact Person</th>
                            <th>Contact Number</th>
                            <th>Action</th>
              </tr>
              </thead>
              <tbody>
                

{clientList.length>0 && clientList.map((client)=>(
                  <>
                       <tr key={client.ClientCode}>
                       <td>{client.FullName}</td>
                       <td>{client.ContactPerson}</td>
                       <td>{client.ContactNumber}</td>

                       <td>
                       <button
                  className="btn btn-primary btn-sm mr-2 rounded-circle"
                  onClick={() => toggleAccordion(client.ClientCode)}
                >
                  <i className={`fa ${openClientId === client.ClientCode ? "fa-minus" : "fa-plus"}`}></i>
                </button>
                          <div className="dropdown-container-box">
                                  <button className="gear-button-box">
                                    <i className="fas fa-cog"></i>
                                  </button>

                                  <div className="dropdown-menu-box">
                                  
                                 
                          <button
                            className="dropdown-item-box"
                            onClick={() => handelClientEdit(client.ClientCode)}
                          >
                            <i
                              className="fas fa-pencil-alt"
                              
                            ></i> Edit
                          </button>
                       <button
                            className="dropdown-item-box"
                           
                            onClick={() => handelClientDelete(client.ClientCode)}
                          >
                            <i className="fas fa-trash"></i>Delete
                          </button>
                                   
                                  </div>
                          </div>
                       </td>
                   </tr>

{openClientId === client.ClientCode && (
  <tr>
    <td colSpan="5">
      <div className="card card-body position-relative">
        {/* <h6>Departments</h6> */}
        <button
          className="btn btn-sm btn-primary add-department-btn"
          onClick={handelAddUser}
          title="Add Department"
        >
          + Add Department
        </button>
        <table className="table mt-4">
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th>Department Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departmentList.length> 0 &&
                  departmentList.map((e) => {
                    return (
                      <tr key={e.DeptId}>
                        {/* <td>{e.DeptId}</td> */}
                        <td>{e.DeptName}</td>
                        <td>
                          <div className="dropdown-container-box">
                                  <button className="gear-button-box">
                                    <i className="fas fa-cog"></i>
                                  </button>

                                  <div className="dropdown-menu-box">
                                  
                                    <button
                            className="dropdown-item-box"
                            onClick={() => handelEdit(e.DeptId)}
                          >
                            <i
                              className="fas fa-pencil-alt"
                              
                            ></i> Edit
                          </button>
                          <button
                            className="dropdown-item-box"
                            
                            onClick={() => handelDelete(e.DeptId)}
                          >
                            <i className="fas fa-trash"></i> Delete
                          </button>
                                   
                                  </div>
                                </div>
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>
    </td>
  </tr>
)} </>
                      ))}
              </tbody>
            </table>
            {/* <div className="textdiv float-right">
              <div>
                {" "}
                Showing {startingEntry} to {endingEntry} of {totalCount} entries
              </div>
              <div className="resdiv">
                <button
                  className="btn btn-light pag-but"
                  onClick={handelPrevious}
                >
                  Previous
                </button>
                <button className="btn btn-light pag-but pag-but-bg">
                  {currentPage}
                </button>
                <button className="btn btn-light pag-but" onClick={handelNext}>
                  Next
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {addUserModel && (
        <div className="addusermodel">
          <div className="modal-dialog">
            <div className="modal-content">
              <div
                className="modal-header show-box"
              >
                <h5 className="modal-title">Add Department</h5>
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
                      <label htmlFor="inputState">Select Client</label>
                      <select
                      className="form-control"
                    onChange={(e)=>{
                    setClientId1(e.target.value)
                    }}
                   value={clientId1}
                  >
                     <option value="">Select Client</option> 
                  {clientList.length>0 && clientList.map((client)=>(
                 <option key={client.ClientCode} value={client.ClientCode}>{client.FullName}</option>
                 ))} 
          </select>
                    </div>

                    <div className="form-group col-md-6">
                      <label htmlFor="inputName4">Name of Department</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          setDepartmentName(e.target.value);
                        }}
                        className="form-control d-block"
                        value={departmentName}
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
              message="Are you sure you want to Add Department?"
              onConfirm={() => handleConfirm()}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}

      {showGroupModel && (
        <div className="addusermodel">
          <div className="modal-dialog model-width">
            <div className="modal-content">
              <div
                className="modal-header show-box"
                
              >
                <h5 className="modal-title">Manege Client</h5>
                <button
                  onClick={handelCloseGroupModel}
                  type="button"
                  className="close-but"
                >
                  <span>&times;</span>
                </button>
              </div>
               <div className="modal-body">
               <form onSubmit={handleGroupSubmit}>
                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Name of Client</label>
                      <input
                      className="form-control d-block"
                        type="text"
                        placeholder="Client Name"
                        onChange={(e) => {
                          setClientName(e.target.value);
                        }}
                        value={clientName}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label >Contact Person</label>
                      <input
                      className="form-control d-block"
                        type="text"
                        placeholder="Contact Person"
                        onChange={(e) => {
                          setContactPerson(e.target.value);
                        }}
                        value={contactPerson}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Contact Number</label>
                      <input
                        className="form-control d-block"
                        type="text"
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
        </div>
      )}

      {showConfirmationDel && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Department?"
          onConfirm={() => handleConfirmDel()}
          onCancel={handleCancelDel}
        />
      )}

      {showConfirmationGroupDel && (
        <ConfirmationPopup
          message="Are you sure you want to delete client?"
          onConfirm={() => handleConfirmGroupDel()}
          onCancel={handleCancelGroupDel}
        />
      )}

      {editUserModel && (
        <EditModel
          empData={singalDeprtment}
          getfun={getDepartmentList}
          setEditUserModel={setEditUserModel}
        />
      )}
       {editClientModel && (
        <EditClientModel
          empData={singalClient}
          getfun={getAllClient}
          setEditUserModel={setEditClientModel}
        />
      )}
  
    </div>
  );
}

export default Group;
