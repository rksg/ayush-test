import { SubInterfaceTable } from './SubInterfaceTable'

interface LagSubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  lagId: string
}

export const LagSubInterfaceTable = (props: LagSubInterfaceTableProps) => {

  return <SubInterfaceTable
    {...props}
    namePath={['lagSubInterfaces', props.serialNumber, props.lagId]}
  ></SubInterfaceTable>
}