import { useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import {
  Checkbox,
  Form,
  Input,
  Tooltip
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useWatch }            from 'antd/lib/form/Form'

import { URLRegExp } from '@acx-ui/rc/utils'

const REDIRECT_TOOLTIP = 'If unchecked, users will reach the page they originally requested'

export function RedirectUrlInput () {
  const form = Form.useFormInstance()
  const [
    redirectCheckbox,
    redirectUrl
  ] = [
    useWatch('redirectCheckbox'),
    useWatch('redirectUrl')
  ]
  const [redirectUrlValue, setRedirectUrlValue] = useState('')

  const redirectCheckboxChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      form.setFieldsValue({ redirectUrl: redirectUrlValue })
    } else {
      setRedirectUrlValue(redirectUrl)
      form.setFieldsValue({ redirectUrl: '' })
    }
  }
  
  return (
    <Form.Item>
      <Form.Item
        noStyle
        name='redirectCheckbox'
        valuePropName='checked'
        initialValue={false}
        children={
          <Checkbox onChange={redirectCheckboxChange}>
              Redirect users to
          </Checkbox>
        }
      />
      <Tooltip title={REDIRECT_TOOLTIP} placement='bottom'>
        <QuestionCircleOutlined />
      </Tooltip>
      <Form.Item
        name='redirectUrl'
        initialValue=''
        rules={[
          { required: redirectCheckbox },
          { validator: (_, value) => URLRegExp(value) }]
        }
        children={
          <Input
            style={{ marginTop: '5px' }} 
            placeholder='e.g. http://www.example.com' 
            disabled={!redirectCheckbox}
          />
        }
      />
    </Form.Item>
  )
}



