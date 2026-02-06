
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import Dashboard from './components/dashboard/Dashboard'
import Login from './components/login/Login'
import Head from './components/body/Head'

import MeetingDetails from './components/addMeeting/MeetingDetails'
import PhysicalMeeting from './components/addMeeting/PhysicalMeeting'
import EditPhysicalMeeting from './components/editMeeting/PhysicalMeeting'
import EditVirtualMeeting from './components/editMeeting/VertualMeeting'
import VirtualMeeting from './components/addMeeting/VirtualMeeting'
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminProtectdRoute from './protectedroutes/protect'
import MeetingDetails1 from './components/addMeeting/MeetingDetails1'


function App() {
  
  const appRouter = createBrowserRouter([
    {
      path:'/',
      element:<Login/>
    },
    {
     path:'/',
     element:<Head/>,
     children:[
      {
        path:'/dashboard',
        element:<AdminProtectdRoute><Dashboard/></AdminProtectdRoute>
      },
      {
        path:'/virtualMeeting',
        element: <AdminProtectdRoute><VirtualMeeting/></AdminProtectdRoute> 
      },
      {
        path:'/physicalMeeting',
        element: <AdminProtectdRoute><PhysicalMeeting/></AdminProtectdRoute> 
      },
      {
        path:'/meetingDetails/:id',
        element:<AdminProtectdRoute><MeetingDetails/></AdminProtectdRoute>  
      },
      {
        path:'/meetingDetails1/:id',
        element:<AdminProtectdRoute><MeetingDetails1/></AdminProtectdRoute>  
      },
      {
        path:'/editPhysicalMeeting/:id',
        element: <AdminProtectdRoute><EditPhysicalMeeting/></AdminProtectdRoute>  
      },
      {
        path:'/editVirtualMeeting/:id',
        element: <AdminProtectdRoute><EditVirtualMeeting/></AdminProtectdRoute>  
      }
     ]
    }
  ])
 
  return (
    <>
     <RouterProvider router={appRouter}/>
     <ToastContainer autoClose={3000}/>
    </>
  )
}

export default App
