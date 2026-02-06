
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './components/login/login'
import DashboardPage from './components/Pages/Dashboard'
import AdminProtectdRoute from './components/protectedroutes/protect'
import EmployeePage from './components/Pages/Employee'
import SummaryReportPage from './components/Pages/SummaryReport'
import { Toaster } from 'react-hot-toast'
import GroupPage from './components/Pages/group'

function App() {

  return (
    <>
    <Routes>
       <Route path='/' element={<Login/>}></Route>
       <Route path='/dashboard' element={<AdminProtectdRoute><DashboardPage/></AdminProtectdRoute>}></Route>
       <Route path='/employee' element={<AdminProtectdRoute><EmployeePage/></AdminProtectdRoute>}></Route>
       <Route path='/summaryReport' element={<AdminProtectdRoute><SummaryReportPage/></AdminProtectdRoute>}></Route>
       <Route path='/group' element={<AdminProtectdRoute><GroupPage/></AdminProtectdRoute>}></Route>
    </Routes>
    <Toaster position="top-center" reverseOrder={false}
       
       />
    </>
  )
}

export default App
