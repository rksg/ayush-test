import { Form, Input, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

// FIXME: Use self definition style component to render
import { FieldLabel } from '../../Devices/Wifi/ApEdit/styledComponents'

import { CommonActionSettings } from './CommonActionSettings'


export function DisplayMessageSetting () {
  const { $t } = useIntl()

  return (<>
    <CommonActionSettings />



    <FieldLabel width='580px' key='key'>
      {$t({ defaultMessage: 'Page Title' })}
      <Form.Item
        name={'displayTitle'}
        valuePropName={'checked'}
      >
        <Switch />
      </Form.Item>
    </FieldLabel>
    <Form.Item
      name={'title'}
      rules={[
        { required: true },
        { min: 1 },
        { max: 100 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'messageHtml'}
      label={$t({ defaultMessage: 'Page Body Text' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 1000 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
      ]}
    >
      <Input.TextArea rows={8} />
    </Form.Item>

    <Form.Item
      name={'backButtonText'}
      label={$t({ defaultMessage: 'Back Button Label' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 20 }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'continueButtonText'}
      label={$t({ defaultMessage: 'Continue Button Label' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 20 }
      ]}
    >
      <Input />
    </Form.Item>
  </>)
}
