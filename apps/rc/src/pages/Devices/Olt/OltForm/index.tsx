import { Form } from 'antd'

import { Olt }       from '@acx-ui/olt/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { OltBasicForm } from './OltBasicForm'

const OltForm = () => {
  // const navigate = useNavigate()
  // const basePath = useTenantLink('/devices/optical/')
  const [form] = Form.useForm()
  const { action } = useParams()
  const editMode = action === 'edit'

  // const [addOlt] = useAddEdgeOltMutation()
  // const [updateOlt] = useUpdateEdgeOltMutation()

  const onFinish = async (data: Partial<Olt>) => {
    // eslint-disable-next-line no-console
    console.log(data)

    // try {
    //   await (editMode ? updateOlt : addOlt)({
    //   }).unwrap()
    //   navigate(`${basePath.pathname}`)
    // } catch (error) {
    //   // eslint-disable-next-line no-console
    //   console.log(error)
    // }
  }

  return (
    <OltBasicForm
      form={form}
      editMode={editMode}
      onFinish={onFinish}
    />
  )
}

export default OltForm