import {
  useAddLagSubInterfacesMutation,
  useDeleteLagSubInterfacesMutation,
  useGetLagSubInterfacesQuery,
  useImportLagSubInterfacesCSVMutation,
  useUpdateLagSubInterfacesMutation
} from '@acx-ui/rc/services'
import { EdgeSubInterface, useTableQuery } from '@acx-ui/rc/utils'

import { SubInterfaceTable } from './SubInterfaceTable'

interface LagSubInterfaceTableProps {
  serialNumber: string
  currentTab: string
  ip: string
  mac: string
  lagId: number
}

export const LagSubInterfaceTable = (props: LagSubInterfaceTableProps) => {

  const { serialNumber, lagId } = props

  const tableQuery = useTableQuery<EdgeSubInterface>({
    useQuery: useGetLagSubInterfacesQuery,
    defaultPayload: {},
    apiParams: { lagId: lagId.toString() }
  })
  const [addSubInterface] = useAddLagSubInterfacesMutation()
  const [updateSubInterface] = useUpdateLagSubInterfacesMutation()
  const [deleteSubInterfaces] = useDeleteLagSubInterfacesMutation()
  const [uploadCSV, uploadCSVResult] = useImportLagSubInterfacesCSVMutation()

  const handleAdd = async (data: EdgeSubInterface) => {
    const requestPayload = {
      params: { serialNumber, lagId: lagId.toString(), subInterfaceId: data?.id },
      payload: data
    }
    await addSubInterface(requestPayload).unwrap()
  }

  const handleUpdate = async (data: EdgeSubInterface) => {
    const requestPayload = {
      params: { serialNumber, lagId: lagId.toString(), subInterfaceId: data?.id },
      payload: data
    }
    await updateSubInterface(requestPayload).unwrap()
  }

  const handleDelete = (data: EdgeSubInterface) => {
    return deleteSubInterfaces({
      params: {
        serialNumber,
        lagId: lagId.toString(),
        subInterfaceId: data?.id }
    })
  }

  const handleUpload = async (formData: FormData) => {
    await uploadCSV({
      params: { serialNumber , lagId: lagId.toString() },
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