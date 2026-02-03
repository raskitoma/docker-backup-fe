import { Dialog } from "primereact/dialog"

export default function VersionModal({ visible, onHide, data }) {

  if (!data) return null

  return (
    <Dialog
      header="Version Status"
      visible={visible}
      style={{
        width: "700px",
        textWrap: "pre-wrap"
      }}
      onHide={onHide}
    >

      <pre style={{
        background: "#111",
        color: "#0f0",
        padding: "10px",
        textWrap: "pre-wrap"
      }}>
        {Object.entries(data).map(([k,v]) =>
          `${k}=${v}\n`
        )}
      </pre>

    </Dialog>
  )
}
