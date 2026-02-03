import { useState } from "react"

import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Tag } from "primereact/tag"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { IconField } from "primereact/iconfield"
import { InputIcon } from "primereact/inputicon"
import { FilterMatchMode, FilterOperator } from 'primereact/api';

import ConfigModal from "./ConfigModal"
import FilesModal from "./FilesModal"
import VersionModal from "./VersionModal"

import { api } from "../api"

export default function ContainersTable({ containers, config }) {

  const [cfgModal,setCfgModal] = useState(false)
  const [filesModal,setFilesModal] = useState(false)
  const [verModal,setVerModal] = useState(false)

  const [selectedConfig,setSelectedConfig] = useState(null)
  const [fileStats,setFileStats] = useState(null)
  const [selectedContainer,setSelectedContainer] = useState(null)
  const [selectedVersion,setSelectedVersion] = useState(null)

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const openVersion = (containerName) => {
    if (!containerName) return
    try {
      api.get(`/versions/${containerName}`).then((res) => {
        setSelectedVersion(res.data)
        setVerModal(true)
      })
    } catch (error) {
      console.error("Error opening version:", error)
    }
  }

  const openConfig = (row) => {
    const config_chosen = (row.in_config) ? config.containers[row.name] : config.containers_ignore[row.name]
    setSelectedConfig(config_chosen)
    setCfgModal(true)
  }

  const openFiles = async (name) => {
    const res = await api.get(`/backups/${name}`)
    setFileStats(res.data)
    setFilesModal(true)
  }

  const statusTemplate = (row) => {
    if(row.deleted) return <Tag severity="danger" value="DELETED"/>
    if(!row.in_config) return <Tag severity="warning" value="NO BACKUP"/>
    if(!row.cleared) return <Tag severity="info" value="BACKUP SET"/>
    return <Tag severity="success" value="OK"/>
  }

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    setGlobalFilterValue('');
  };

  const clearFilter = () => {
    initFilters();
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters['global'].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-between">
        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined size="small" onClick={clearFilter} />
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
        </IconField>
      </div>
    );
  };  

  const header = renderHeader();

  return (
    <>
      <DataTable
        value={containers}
        paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        dataKey="name"
        filters={filters}
        filterDisplay="menu"
        globalFilterFields={['name', 'status']}
        size="small"
        sortMode="multiple"
        showGridlines
        stripedRows
        rowHover
        selectionMode="single"
        sortField="name"
        sortOrder={1}
        header={header}
        scrollable scrollHeight="flex"
        emptyMessage="No containers found."
      >
        <Column
          field="name"
          header="Container"
          filter
          filterPlaceholder="Search by container name"
          style={{ minWidth: '12rem' }}
          sortable
        />

        <Column body={statusTemplate} header="Status" sortable/>

        <Column
          header="Config"
          body={(row)=> (
            <Button
              icon="pi pi-cog"
              text
              onClick={()=>openConfig(row)}
            />
          )}
        />

        <Column
          header="Files"
          body={(row)=>
            row.in_config &&
            <Button
              icon="pi pi-folder"
              text
              onClick={()=>openFiles(row.name)}
            />
          }
        />

        <Column
          header="Version"
          body={(row)=> (
            <Button
              icon="pi pi-info-circle"
              text
              onClick={()=>openVersion(row.name)}
            />
          )}
        />

      </DataTable>

      <ConfigModal
        visible={cfgModal}
        onHide={()=>setCfgModal(false)}
        data={selectedConfig}
      />

      <VersionModal
        visible={verModal}
        onHide={()=>setVerModal(false)}
        data={selectedVersion}
      />


      <FilesModal
        visible={filesModal}
        onHide={()=>setFilesModal(false)}
        stats={fileStats}
      />

    </>
  )
}
