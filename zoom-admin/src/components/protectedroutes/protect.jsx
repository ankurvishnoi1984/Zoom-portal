import { Navigate } from "react-router-dom";

const AdminProtectdRoute = ({children}) => {
    
    const isAdminLoggedIn = sessionStorage.getItem('IsAdminLoggedIn') === 'true';
    if(!isAdminLoggedIn){
        return <Navigate to='/'  replace={true}></Navigate>
     }
     return children;
}

export default AdminProtectdRoute