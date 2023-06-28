import { useState } from 'react'

import {
  Checkbox,
  Form,
  Input
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { Tooltip }                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { URLRegExp }                  from '@acx-ui/rc/utils'

export function RedirectUrlInput () {
  const intl = useIntl()

  const REDIRECT_TOOLTIP =
    intl.$t({ defaultMessage: 'If unchecked, users will reach the page they originally requested' })

  const form = Form.useFormInstance()
  const { useWatch } = Form
  const [
    redirectCheckbox,
    redirectUrl
  ] = [
    useWatch('redirectCheckbox'),
    useWatch(['guestPortal','redirectUrl'])
  ]
  const [redirectUrlValue, setRedirectUrlValue] = useState('')

  const redirectCheckboxChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      form.setFieldValue(['guestPortal','redirectUrl'], redirectUrlValue)
    } else {
      setRedirectUrlValue(redirectUrl)
      form.setFieldValue(['guestPortal','redirectUrl'], null)
    }
  }

  return (
    <Form.Item><>
      <Form.Item
        noStyle
        name='redirectCheckbox'
        valuePropName='checked'
        initialValue={false}
        children={
          <Checkbox onChange={redirectCheckboxChange}>
            {intl.$t({ defaultMessage: 'Redirect users to' })}
          </Checkbox>
        }
      />
      <Tooltip title={REDIRECT_TOOLTIP} placement='bottom'>
        <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>
      <Form.Item
        name={['guestPortal','redirectUrl']}
        rules={[
          { required: redirectCheckbox },
          { validator: (_, value) => redirectCheckbox ? URLRegExp(value) : Promise.resolve() }
        ]}
        children={
          <Input
            style={{ marginTop: '5px' }}
            placeholder={intl.$t({ defaultMessage: 'e.g. http://www.example.com' })}
            disabled={!redirectCheckbox}
          />
        }
      /></>
    </Form.Item>
  )
}



