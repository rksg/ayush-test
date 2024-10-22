import { SubInterfaceTable } from './SubInterfaceTable'

interface PortSubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  portId: string,
}

export const PortSubInterfaceTable = (props: PortSubInterfaceTableProps) => {

  return <SubInterfaceTable
    {...props}
    namePath={['portSubInterfaces', props.serialNumber, props.portId]}
  ></SubInterfaceTable>
}