import { useContext, useEffect, useState } from 'react'

import {
  Checkbox,
  Form,
  Input
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }             from 'react-intl'

import { Tooltip }                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { HttpURLRegExp }              from '@acx-ui/rc/utils'

import NetworkFormContext from '../NetworkFormContext'

export function RedirectUrlInput () {
  const intl = useIntl()

  const {
    data,
    setData,
    editMode,
    cloneMode
  } = useContext(NetworkFormContext)

  const REDIRECT_TOOLTIP =
    intl.$t({ defaultMessage: 'If unchecked, users will reach the page they originally requested' })

  const REDIRECT_INVALID_MSG =
    // eslint-disable-next-line max-len
    intl.$t({ defaultMessage: 'Please enter the redirect URL. It should start with \'http\' or \'https\' and include a valid domain name or IP address.' })

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

  useEffect(() => {
    if((editMode || cloneMode) && data){
      if(data.guestPortal?.redirectUrl){
        form.setFieldValue('redirectCheckbox',true)
      }
    }
  }, [data])

  const redirectCheckboxChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      form.setFieldValue(['guestPortal','redirectUrl'], redirectUrlValue)
    } else {
      setRedirectUrlValue(redirectUrl)
      form.setFieldValue(['guestPortal','redirectUrl'], undefined)
    }

    if(editMode && data) {
      setData && setData({
        ...data,
        guestPortal: {
          ...data.guestPortal,
          ...(e.target.checked ? {
            redirectUrl: redirectUrlValue
          } : {
            redirectUrl: undefined
          })
        }
      })
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
          { required: redirectCheckbox,
            message: REDIRECT_INVALID_MSG
          },
          { validator: (_, value) => redirectCheckbox ? HttpURLRegExp(value) : Promise.resolve(),
            message: REDIRECT_INVALID_MSG
          }
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



