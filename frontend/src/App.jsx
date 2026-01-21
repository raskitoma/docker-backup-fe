import { useEffect, useState } from "react"
import { Button } from "primereact/button"

import HostHeader from "./components/HostHeader"
import ContainersTable from "./components/ContainersTable"
import ConfigAccordion from "./components/ConfigAccordion"

import { api } from "./api"

export default function App() {

  const [system,setSystem] = useState({})
  const [config,setConfig] = useState({})
  const [containers,setContainers] = useState([])

  const loadAll = async () => {
    try {
      const s = await api.get("/system")
      const c = await api.get("/config")
      const ct = await api.get("/containers")

      console.log("SYSTEM:", s.data)
      console.log("CONFIG:", c.data)
      console.log("CONTAINERS:", ct.data)

      setSystem(s.data)
      setConfig(c.data)
      setContainers(ct.data)

    } catch (err) {
      console.error("API ERROR:", err)
    }
  }

  useEffect(()=>{
    loadAll()
  },[])

  return (
    <div className="p-4">

      <div className="flex justify-content-between align-items-center mb-3">

        <HostHeader system={system}/>

        <Button
          icon="pi pi-refresh"
          label="Refresh"
          onClick={loadAll}
        />

      </div>

      <ConfigAccordion config={config}/>

      <ContainersTable containers={containers} config={config}/>

    </div>
  )
}
