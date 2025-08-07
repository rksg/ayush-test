import { Form } from 'antd'

import { Olt }                                   from '@acx-ui/olt/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { oltData } from '../mockdata'

import { OltBasicForm } from './OltBasicForm'

const OltForm = () => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/devices/optical/')
  const [form] = Form.useForm()
  const { action } = useParams()
  const editMode = action === 'edit'

  // const [addOlt] =
  // const [updateOlt] =

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onFinish = async (data: Partial<Olt>) => {
    try {
      // await (editMode ? updateOlt : addOlt)({
      // }).unwrap()
      navigate(`${basePath.pathname}`)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <OltBasicForm
      form={form}
      data={editMode ? oltData : undefined}
      editMode={editMode}
      onFinish={onFinish}
    />
  )
}

export default OltForm