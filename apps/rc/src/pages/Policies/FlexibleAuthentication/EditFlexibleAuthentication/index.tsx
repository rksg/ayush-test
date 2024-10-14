import { Form } from 'antd'
// import { useIntl }        from 'react-intl'

import { FlexibleAuthenticationForm } from '@acx-ui/rc/components'
import { FlexibleAuthentication }     from '@acx-ui/rc/utils'

const EditFlexibleAuthentication = () => {
  // const { $t } = useIntl()
  const [form] = Form.useForm()

  const onFinish = async (data: FlexibleAuthentication) => {
    console.log(data) // eslint-disable-line no-console
    try {

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <FlexibleAuthenticationForm
      form={form}
      editMode={true}
      onFinish={onFinish}
    />
  )
}

export default EditFlexibleAuthentication