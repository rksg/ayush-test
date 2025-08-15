import { Form } from 'antd'

import { OltForm as OltBasicForm }               from '@acx-ui/olt/components'
import { Olt, OltMockdata }                      from '@acx-ui/olt/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const { oltData } = OltMockdata

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