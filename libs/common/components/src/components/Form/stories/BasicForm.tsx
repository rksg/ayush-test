import { useEffect } from 'react'

import { Form } from 'antd'

import { FormValidationItem } from '..'
import { formItemLayout }     from '../index'

export function BasicForm () {
  const [form] = Form.useForm()
  const mockRemoteValidation = (isFetching, searchString) => {
    return {
      listQuery: {
        isFetching: isFetching,
        data: {
          data: [{
            id: 'fakeid',
            name: 'error'
          }]
        }
      },
      payload: {
        searchString: searchString 
      },
      message: 'error message',
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
      <FormValidationItem
        label='Normal'
        placeholder='Type something'
      />
      <FormValidationItem
        name='validating'
        label='Validating'
        remoteValidation={mockRemoteValidation(true, 'text')}
      />
      <FormValidationItem
        name='error'
        label='Error'
        remoteValidation={mockRemoteValidation(false, 'error')}
      />
      <FormValidationItem
        name='success'
        label='Success'
        remoteValidation={mockRemoteValidation(false, 'text')}
      />
    </Form>
  )
}