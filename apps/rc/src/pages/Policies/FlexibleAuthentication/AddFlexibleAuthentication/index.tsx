import { Form } from 'antd'
// import { useIntl }        from 'react-intl'

// import {
//   useParams
// } from '@acx-ui/react-router-dom'

import { FlexibleAuthenticationForm, FlexibleAuthentication } from '../FlexibleAuthenticationForm'

export const AddFlexibleAuthentication = () => {
  // const { $t } = useIntl()
  const [form] = Form.useForm()

  const onFinish = async (data: FlexibleAuthentication) => {
    // console.log(data)
    try {

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