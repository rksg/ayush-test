import { Form } from 'antd'
// import { ReactNode, useEffect, useRef, useState } from 'react'
// import { useIntl }        from 'react-intl'

// import {
//   useParams
// } from '@acx-ui/react-router-dom'

import { FlexibleAuthenticationForm, FlexibleAuthentication } from '../FlexibleAuthenticationForm'

const EditFlexibleAuthentication = () => {
  // const { $t } = useIntl()
  const [form] = Form.useForm()
  // const params = useParams()

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
      editMode={true}
      onFinish={onFinish}
    />
  )
}

export default EditFlexibleAuthentication