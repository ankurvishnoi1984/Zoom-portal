import { createContext, useState } from "react";


export const LoginContext = createContext();

export const LoginContextProvider = ({children})=>{
 
     const [clientId, setClientId]= useState(null);
     const [deptId, setDeptId]= useState(null);

     const handelSetClientId = (value)=>{
      setClientId(value)
     }

     const handelSetDeptId = (value)=>{
      setDeptId(value)
     }


    return <LoginContext.Provider value={{deptId,clientId,handelSetClientId,handelSetDeptId}}>{children}</LoginContext.Provider>

}