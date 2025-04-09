import { useContext } from 'react'

import {
  useAddSubInterfacesMutation,
  useDeleteSubInterfacesMutation,
  useGetSubInterfacesQuery,
  useImportSubInterfacesCSVMutation,
  useUpdateSubInterfacesMutation
} from '@acx-ui/rc/services'
import { convertEdgeSubInterfaceToApiPayload, EdgeSubInterface, useTableQuery } from '@acx-ui/rc/utils'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

import { SubInterfaceTable } from './SubInterfaceTable'

interface PortSubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  portId: string
}

export const PortSubInterfaceTable = (props: PortSubInterfaceTableProps) => {
  const { serialNumber, portId } = props
  const { generalSettings } = useContext(EditEdgeDataContext)
  const { venueId, clusterId: edgeClusterId } = generalSettings!

  const tableQuery = useTableQuery<EdgeSubInterface>({
    useQuery: useGetSubInterfacesQuery,
    defaultPayload: {},
    apiParams: {
      venueId: venueId!,
      edgeClusterId: edgeClusterId!,
      serialNumber,
      portId
    }
  })
  const [addSubInterface] = useAddSubInterfacesMutation()
  const [updateSubInterface] = useUpdateSubInterfacesMutation()
  const [deleteSubInterfaces] = useDeleteSubInterfacesMutation()
  const [uploadCSV, uploadCSVResult] = useImportSubInterfacesCSVMutation()

  const handleAdd = async (data: EdgeSubInterface) => {
    const payloadData = convertEdgeSubInterfaceToApiPayload(data)

    const requestPayload = {
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        portId
      },
      payload: payloadData
    }

    await addSubInterface(requestPayload).unwrap()
  }

  const handleUpdate = async (data: EdgeSubInterface) => {
    const payloadData = convertEdgeSubInterfaceToApiPayload(data)

    const requestPayload = {
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        portId,
        subInterfaceId: data?.id
      },
      payload: payloadData
    }
    await updateSubInterface(requestPayload).unwrap()
  }

  const handleDelete = async (data: EdgeSubInterface) => {
    return await deleteSubInterfaces({
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        portId,
        subInterfaceId: data?.id }
    }).unwrap()
  }

  const handleUpload = async (formData: FormData) => {
    await uploadCSV({
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        portId
      },
      payload: formData
    }).unwrap()
  }

  return <SubInterfaceTable
    {...props}
    tableQuery={tableQuery}
    handleAdd={handleAdd}
    handleUpdate={handleUpdate}
    handleDelete={handleDelete}
    handleUpload={handleUpload}
    uploadResult={uploadCSVResult}
  />
}