import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL } from "../constant/constant";

//import { ToastContainer, toast } from "react-toastify";
import "./employee.css";

//import "react-toastify/dist/ReactToastify.css";
import ConfirmationPopup from "../popup/Popup";
import EditModel from "./editEmpModel";
import toast from "react-hot-toast";
//import Loader1 from "../utils/Loader1";
function Employee() {

  //const userId = sessionStorage.getItem('userId');

  //const [loader,setLoading] = useState(false);
  const [name, SetName] = useState("");
  const [empcode, SetEmpcode] = useState("");
  //const [state, SetState] = useState("");
  const [hq, SetHq] = useState("");
  //const [city, SetCity] = useState("");
  //const [pincode, SetPincode] = useState("");
  const [designation, SetDesignation] = useState("")
  const [reporting, SetReporting] = useState("");
  const [password, SetPassword] = useState("");
  //const [role, SetRole] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmationDel, setShowConfirmationDel] = useState(false);
  const [delId, setDelId] = useState(null);

  const [addUserModel, setAddUserModel] = useState(false);
  const [editUserModel, setEditUserModel] = useState(false);

  const [empData, setEmpData] = useState([]);
  const [singalEmpData, setSingalEmpData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  

  const handelAddUser = () => {
    setAddUserModel(true);
  };

  const handelEdit = async (id) => {
    await GetEmpWithId(id);
    setEditUserModel(true);
  };
  const handelDelete = async (id) => {
    setDelId(id);
    setShowConfirmationDel(true);
    
  };
  const handleConfirmDel = async () => {
    setShowConfirmationDel(false);
    try {
      const res = await axios.post(`${BASEURL}/admin/deleteEmp`,{delId});
      //console.log("delete responce",res)
      if (res.data.errorCode == "1") {
        toast.success("Employee Deleted successfully");
        await GetEmpData();
      } else {
        toast.error(`Failed to delete employee with ID ${delId}`);
      }
    } catch (error) {
      console.log(error)
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
      !name ||
      !empcode ||
       !hq ||
      //  !designation ||
      // !reporting ||
      !password
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
      const res = await axios.post(`${BASEURL}/admin/addEmp`, {
        name,
        empcode,
        hq,
        // designation,
        // reporting,
        password
      });
      toast.success("Employee created successfully");
      await GetEmpData();
    } catch (error) {
      console.log(error);
    }

    SetName("");
    SetEmpcode("");
    SetHq("");
    // SetDesignation("");
    // SetReporting("");
    SetPassword("");
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    GetEmpData();
  }, [currentPage, searchQuery, totalCount]);

  async function GetEmpWithId(id) {
    try {
      const res = await axios.get(`${BASEURL}/admin/getEmpWithId/${id}`);
      setSingalEmpData(res?.data?.user[0]);
    } catch (error) {
      console.log(error);
    }
  }

  async function GetEmpData() {
   
    try {
      const res = await axios.get(
        `${BASEURL}/admin/getAllEmployee?page=${currentPage}&limit=20&searchName=${searchQuery}`
      );
      console.log("inside empdata", res?.data?.users);
      setTotalCount(res?.data?.totalCount);
      setEmpData(res?.data?.users);
    } catch (error) {
      console.log(error);
    }
   
  }

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

  return  (
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
          </div>
        </form>
        <button
          className="btn btn-primary btn-icon-split mt-3"
          onClick={handelAddUser}
        >
          <span className="icon text-white-50">
            <i className="fas fa-plus"></i>
          </span>
          <span className="text">Add User</span>
        </button>
      </div>
      {/* Content Row */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="table-responsive">
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
            >
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee Code</th>
                  <th>Hq</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {empData &&
                  empData.map((e) => {
                    return (
                      <tr key={e.user_id}>
                        <td>{e.name}</td>
                        <td>{e.empcode}</td>               
                        <td>{e.hq}</td>
                        <td>
                          <button
                            className="btn-sm btn-primary btn-circle m-1"
                            style={{ border: "none" }}
                            onClick={() => handelEdit(e.user_id)}
                          >
                            <i
                              className="fas fa-pencil-alt"
                              
                            ></i>
                          </button>
                          <button
                            className="btn-sm btn-primary btn-circle m-1"
                            style={{ border: "none" }}
                            onClick={() => handelDelete(e.user_id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="textdiv">
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
                <button className="btn btn-light pag-but pag-but-bg ml-1">
                  {currentPage}
                </button>
                <button className="btn btn-light pag-but ml-1" onClick={handelNext}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {addUserModel && (
        <div className="addusermodel">
          <div className="modal-dialog">
            <div className="modal-content">
              <div
                className="modal-header"
                style={{ backgroundColor: "#10387a", color: "#fff" }}
              >
                <h5 className="modal-title">Add Employee</h5>
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
                      <label htmlFor="inputName4">Name Of Employee</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          SetName(e.target.value);
                        }}
                        className="form-control"
                        id="inputName4"
                        name="name"
                        placeholder="Name"
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label htmlFor="Code">Employee Code</label>
                      <input
                        type="number"
                        onChange={(e) => {
                          SetEmpcode(e.target.value);
                        }}
                        className="form-control"
                        id="Code"
                        name="code"
                        placeholder="Code"
                      />
                    </div>
                    
                    <div className="form-group col-md-6">
                      <label htmlFor="HQ">HQ</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          SetHq(e.target.value);
                        }}
                        className="form-control"
                        id="HQ"
                        name="hq"
                        placeholder="HQ"
                      />
                    </div>
                    {/* <div className="form-group col-md-6">
                      <label htmlFor="designation">Designation</label>
                      <select
                        id="inputState"
                        onChange={(e) => {
                          SetDesignation(e.target.value);
                        }}
                        className="form-control"
                        name="designation"
                      >
                        <option value="">Select...</option>
                        <option value="ZBM">ZBM</option>
                        <option value="RBM">RBM</option>
                        <option value="ABM">ABM</option>
                        <option value="TM">TM</option>
 
                      </select>
                    
                    </div> */}
                    {/* {designation !== "ZBM" && <div className="form-group col-md-6">
                      <label htmlFor="reporting">Reporting</label>
                      <input
                        type="number"
                        onChange={(e) => {
                          SetReporting(e.target.value);
                        }}
                        className="form-control"
                        id="reporting"
                        name="reporting"
                        placeholder="Employee Code"
                      />
                    </div>} */}
                    {/* <div className="form-group col-md-6">
                      <label htmlFor="inputState">Role</label>
                      <select
                        id="inputState"
                        onChange={(e) => {
                          SetRole(e.target.value);
                        }}
                        className="form-control"
                        name="designation"
                      >
                        <option value="ZBM">ZBM</option>
                        <option value="RBM">RBM</option>
                        <option value="ABM">ABM</option>
                        <option value="TM">TM</option>
 
                      </select>
                    </div> */}
                    <div className="form-group col-md-6">
                      <label htmlFor="password">Password</label>
                      <input
                        type="text"
                        onChange={(e) => {
                          SetPassword(e.target.value);
                        }}
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="Password"
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
              message="Are you sure you want to Add Employee?"
              onConfirm={() => handleConfirm()}
              onCancel={handleCancel}
            />
          )}
        </div>
      )}

      {showConfirmationDel && (
        <ConfirmationPopup
          message="Are you sure you want to Delete Employee?"
          onConfirm={() => handleConfirmDel()}
          onCancel={handleCancelDel}
        />
      )}

      {editUserModel && (
        <EditModel
          empData={singalEmpData}
          getfun={GetEmpData}
          setEditUserModel={setEditUserModel}
        />
      )}
    
    </div>
  );
}

export default Employee;
