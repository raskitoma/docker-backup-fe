import { useEffect, useState } from "react"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { TabView, TabPanel } from "primereact/tabview"
import { DataTable} from "primereact/datatable"
import { Column } from "primereact/column"
import { Tag } from "primereact/tag"
import HostHeader from "./components/HostHeader"
import ContainersTable from "./components/ContainersTable"
import ConfigAccordion from "./components/ConfigAccordion"

import { api, apiDebug } from "./api"

const API_DEBUG = import.meta.env.VITE_DEBUG || false

export default function App() {

  const [system,setSystem] = useState({})
  const [config,setConfig] = useState({})
  const [containers,setContainers] = useState([])
  const [status,setStatus] = useState({})
  const [statusDetailed,setStatusDetailed] = useState({})
  const [statusVisible,setStatusVisible] = useState(false)

  const loadAll = async () => {
    try {
      const s = await api.get("/system")
      setSystem(s.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const c = await api.get("/config")
      setConfig(c.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const ct = await api.get("/containers")
      const filteredContainers = ct.data.filter(
        (container) => !container.name.startsWith("docker_backup_")
    );

setContainers(filteredContainers);
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const rs = API_DEBUG ? await apiDebug.get("/status") : await api.get("/status")
      console.log("Status data:", rs.data);
      setStatus(rs.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }

    try {
      const rsd = API_DEBUG ? await apiDebug.get("/status_detailed") : await api.get("/status_detailed")
      console.log("Detailed Status data:", rsd.data);
      setStatusDetailed(rsd.data)
    } catch (error) {
      console.error("Error loading data from API:", error)
    }
  }

  const showStatus = () => {
    setStatusVisible(true)
  }

  useEffect(()=>{
    loadAll()
  },[])

  const getSeverity = (status) => {
    switch (status) {
      case 'error':
        return 'danger';
      case 'success':
        return 'success';
      case 'failed':
        return 'danger';
      case 'completed':
        return 'success';
      case 'new':
        return 'info';
      case 'warn':
        return 'warning';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };  

  const statusItemTemplate = (option) => {
    console.log("Status item option:", option);
    return <Tag value={option.result} severity={getSeverity(option.result)} />;
  };  

  const statusItemTemp = (option) => {
    console.log("Status item option:", option);
    return <Tag value={option.backupstatus} severity={getSeverity(option.backupstatus)} />;
  };  


  return (
    <div className="p-4">

      <div className="flex justify-content-between align-items-center mb-6 gap-3">

        <HostHeader system={system}/>

        <Button
          icon="pi pi-list"
          label="Status"
          onClick={showStatus}
          severity="help"
          size="small"
        />


        <Button
          icon="pi pi-refresh"
          label="Reload"
          onClick={loadAll}
          size="small"
        />

      </div>

      <ConfigAccordion 
        config={config}
      />

      <ContainersTable
        containers={containers}
        config={config}
      />

      <Dialog
        header="Status Details"
        visible={statusVisible}
        style={{
          width: '100vw',
          height: '90vh'
        }}
        onHide={() => setStatusVisible(false)}
      >
        <TabView>
          <TabPanel header="Summary">
            <DataTable
              value={status}
              size="small"
              showGridlines rowHover stripedRows
              paginator rows={10}
              rowsPerPageOptions={[5,10,25]}
              sortField="timestamp" sortOrder={-1}
            >
              <Column field="timestamp" header="Last Backup" />
              <Column field="container" header="Container Name" />
              <Column
                field="backupstatus"
                header="Status"
                body={statusItemTemp}

              />
            </DataTable>
          </TabPanel>
          <TabPanel header="Raw Summary">
            <DataTable
              value={statusDetailed}
              size="small"
              showGridlines rowHover stripedRows
              paginator rows={10}
              rowsPerPageOptions={[5,10,25]}
              sortField="timestamp" sortOrder={-1}
            >
              <Column field="timestamp" header="Timestamp" sortable filter />
              <Column field="container" header="Container Name" sortable filter />
              <Column field="result" header="Result" sortable filter
                body={statusItemTemplate}
              />
              <Column field="message" header="Details" sortable filter />
            </DataTable>
          </TabPanel>
        </TabView>
      </Dialog>

    </div>
  )
}
