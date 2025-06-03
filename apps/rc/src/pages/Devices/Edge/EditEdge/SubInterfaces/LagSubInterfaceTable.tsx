import { useContext } from 'react'

import {
  useAddLagSubInterfacesMutation,
  useDeleteLagSubInterfacesMutation,
  useGetLagSubInterfacesQuery,
  useImportLagSubInterfacesCSVMutation,
  useUpdateLagSubInterfacesMutation
} from '@acx-ui/rc/services'
import { EdgeSubInterface, convertEdgeSubInterfaceToApiPayload, useTableQuery } from '@acx-ui/rc/utils'

import { EditEdgeDataContext } from '../EditEdgeDataProvider'

import { SubInterfaceTable } from './SubInterfaceTable'

interface LagSubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  lagId: number
  isSupportAccessPort?: boolean
}

export const LagSubInterfaceTable = (props: LagSubInterfaceTableProps) => {
  const { serialNumber, lagId } = props
  const { generalSettings } = useContext(EditEdgeDataContext)
  const { venueId, clusterId: edgeClusterId } = generalSettings!

  const tableQuery = useTableQuery<EdgeSubInterface>({
    useQuery: useGetLagSubInterfacesQuery,
    defaultPayload: {},
    apiParams: {
      venueId: venueId!,
      edgeClusterId: edgeClusterId!,
      serialNumber,
      lagId: lagId.toString()
    }
  })
  const [addSubInterface] = useAddLagSubInterfacesMutation()
  const [updateSubInterface] = useUpdateLagSubInterfacesMutation()
  const [deleteSubInterfaces] = useDeleteLagSubInterfacesMutation()
  const [uploadCSV, uploadCSVResult] = useImportLagSubInterfacesCSVMutation()

  const handleAdd = async (data: EdgeSubInterface) => {
    const payloadData = convertEdgeSubInterfaceToApiPayload(data)

    const requestPayload = {
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        lagId: lagId.toString()
      },
      payload: payloadData
    }
    await addSubInterface(requestPayload).unwrap()
  }

  const handleUpdate = async (data: EdgeSubInterface) => {
    const { id, ...payloadData } = convertEdgeSubInterfaceToApiPayload(data)

    const requestPayload = {
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        lagId: lagId.toString(),
        subInterfaceId: id },
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
        lagId: lagId.toString(),
        subInterfaceId: data?.id }
    }).unwrap()
  }

  const handleUpload = async (formData: FormData) => {
    await uploadCSV({
      params: {
        venueId,
        edgeClusterId,
        serialNumber,
        lagId: lagId.toString() },
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