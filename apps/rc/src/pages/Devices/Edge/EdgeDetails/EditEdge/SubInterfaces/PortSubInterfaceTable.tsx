import { useAddSubInterfacesMutation, useDeleteSubInterfacesMutation, useGetSubInterfacesQuery, useImportSubInterfacesCSVMutation, useUpdateSubInterfacesMutation } from '@acx-ui/rc/services'
import { EdgeSubInterface, useTableQuery }                                                                                                                          from '@acx-ui/rc/utils'

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

  const tableQuery = useTableQuery<EdgeSubInterface>({
    useQuery: useGetSubInterfacesQuery,
    defaultPayload: {},
    apiParams: { serialNumber, portId }
  })
  const [addSubInterface] = useAddSubInterfacesMutation()
  const [updateSubInterface] = useUpdateSubInterfacesMutation()
  const [deleteSubInterfaces] = useDeleteSubInterfacesMutation()
  const [uploadCSV, uploadCSVResult] = useImportSubInterfacesCSVMutation()

  const handleAdd = async (data: EdgeSubInterface) => {
    const requestPayload = {
      params: { serialNumber, portId, subInterfaceId: data?.id },
      payload: data
    }
    await addSubInterface(requestPayload).unwrap()
  }

  const handleUpdate = async (data: EdgeSubInterface) => {
    const requestPayload = {
      params: { serialNumber, portId, subInterfaceId: data?.id },
      payload: data
    }
    await updateSubInterface(requestPayload).unwrap()
  }

  const handleDelete = async (data: EdgeSubInterface) => {
    return await deleteSubInterfaces({
      params: {
        serialNumber,
        portId,
        subInterfaceId: data?.id }
    }).unwrap()
  }

  const handleUpload = async (formData: FormData) => {
    await uploadCSV({
      params: { serialNumber , portId },
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