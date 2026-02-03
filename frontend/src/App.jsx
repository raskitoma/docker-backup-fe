import { useEffect, useState } from "react"
import { Button } from "primereact/button"

import HostHeader from "./components/HostHeader"
import ContainersTable from "./components/ContainersTable"
import ConfigAccordion from "./components/ConfigAccordion"

import { api, apiDebug } from "./api"

const API_DEBUG = import.meta.env.VITE_DEBUG || false

console.log(API_DEBUG)

export default function App() {

  const [system,setSystem] = useState({})
  const [config,setConfig] = useState({})
  const [containers,setContainers] = useState([])
  const [status,setStatus] = useState({})
  const [statusDetailed,setStatusDetailed] = useState({})
  const [versionData, setVersionData] = useState({})
  const [selectedContainer, setSelectedContainer] = useState(null)

  const loadVersionData = async () => {
    if (!selectedContainer) return
    try {
      const v = API_DEBUG ? await apiDebug.get(`/versions/${selectedContainer}`) : await api.get(`/versions/${selectedContainer}`)
      console.log("VERSION DATA:", v.data)
      setVersionData(v.data)
    } catch (error) {
      console.error("Error loading version data from API:", error)
    }
  }

  const loadAll = async () => {
    try {
      const s = await api.get("/system")
      setSystem(s.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const c = await api.get("/config")
      console.log("CONFIG:", c.data)
      setConfig(c.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const ct = await api.get("/containers")
      setContainers(ct.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const rs = API_DEBUG ? await apiDebug.get("/status") : await api.get("/status")
      console.log("STATUS:", rs.data)
      setStatus(rs.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const rsd = API_DEBUG ? await apiDebug.get("/status_detailed") : await api.get("/status_detailed")
      console.log("STATUS DETAILED:", rsd.data)
      setStatusDetailed(rsd.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }
  }

  useEffect(()=>{
    loadAll()
  },[])

  return (
    <div className="p-4">

      <div className="flex justify-content-between align-items-center mb-6 gap-3">

        <HostHeader system={system}/>

        <Button
          icon="pi pi-refresh"
          label="Reload"
          onClick={loadAll}
          size="small"
        />

      </div>

      <ConfigAccordion config={config}/>

      <ContainersTable containers={containers} config={config}/>

    </div>
  )
}
