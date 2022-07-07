import { useEffect } from 'react'

import { Form, Input } from 'antd'

import { FormValidationItem } from '..'

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 }
  }
}

export function BasicForm () {
  const [form] = Form.useForm()
  const mockRemoteValidation = (isValid) => {
    return {
      queryResult: [],
      message: 'error message',
      isValidating: false,
      validator: () => isValid,
      updateQuery: () => {}
    }
  }

  form.setFieldsValue({
    validating: 'validating',
    error: 'error',
    success: 'text'
  })

  useEffect(()=>{
    form.validateFields(['validating', 'error', 'success'])
  }, [form])  
  
  return (
    <Form {...formItemLayout} form={form}>
      <Form.Item label='Normal'>
        <Input placeholder='Type something' />
      </Form.Item>
      <FormValidationItem
        name='validating'
        label='Validating'
        value=''
        remoteValidation={mockRemoteValidation(true)}
      />
      <FormValidationItem
        name='error'
        label='Error'
        value='error'
        remoteValidation={mockRemoteValidation(false)}
      />
      <FormValidationItem
        name='success'
        label='Success'
        value='text'
        remoteValidation={mockRemoteValidation(true)}
      />
    </Form>
  )
}