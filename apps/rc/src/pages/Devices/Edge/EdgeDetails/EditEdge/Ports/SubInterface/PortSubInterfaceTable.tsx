import { useAddSubInterfacesMutation, useDeleteSubInterfacesMutation, useGetSubInterfacesQuery, useImportSubInterfacesCSVMutation, useUpdateSubInterfacesMutation } from '@acx-ui/rc/services'
import { EdgeSubInterface, useTableQuery }                                                                                                                          from '@acx-ui/rc/utils'

import { SubInterfaceTable } from './SubInterfaceTable'

interface PortSubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
}

export const PortSubInterfaceTable = (props: PortSubInterfaceTableProps) => {

  const { serialNumber, mac } = props

  const tableQuery = useTableQuery<EdgeSubInterface>({
    useQuery: useGetSubInterfacesQuery,
    defaultPayload: {},
    apiParams: { mac }
  })
  const [addSubInterface] = useAddSubInterfacesMutation()
  const [updateSubInterface] = useUpdateSubInterfacesMutation()
  const [deleteSubInterfaces] = useDeleteSubInterfacesMutation()
  const [uploadCSV, uploadCSVResult] = useImportSubInterfacesCSVMutation()

  const handleAdd = async (data: EdgeSubInterface) => {
    const requestPayload = {
      params: { serialNumber, mac, subInterfaceId: data?.id },
      payload: data
    }
    await addSubInterface(requestPayload).unwrap()
  }

  const handleUpdate = async (data: EdgeSubInterface) => {
    const requestPayload = {
      params: { serialNumber, mac, subInterfaceId: data?.id },
      payload: data
    }
    await updateSubInterface(requestPayload).unwrap()
  }

  const handleDelete = (serialNumber: string, mac: string, id: string) => {
    return deleteSubInterfaces({
      params: {
        serialNumber,
        mac,
        subInterfaceId: id }
    })
  }

  const handleUpload = async (serialNumber: string, formData: FormData) => {
    await uploadCSV({
      params: { serialNumber , mac },
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