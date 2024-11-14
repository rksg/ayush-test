import { Form } from 'antd'

import { FlexibleAuthenticationForm }              from '@acx-ui/rc/components'
import { useAddFlexAuthenticationProfileMutation } from '@acx-ui/rc/services'
import { FlexibleAuthentication }                  from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }              from '@acx-ui/react-router-dom'

export const AddFlexibleAuthentication = () => {
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/')
  const [form] = Form.useForm()
  const [addFlexAuthenticationProfile] = useAddFlexAuthenticationProfileMutation()

  const onFinish = async (data: FlexibleAuthentication) => {
    try {
      await addFlexAuthenticationProfile({
        payload: data
      }).unwrap()
      navigate(`${basePath.pathname}/authentication/list`)

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <FlexibleAuthenticationForm
      form={form}
      editMode={false}
      onFinish={onFinish}
    />
  )
}

export default AddFlexibleAuthentication