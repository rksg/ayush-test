import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { ActionType, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

// FIXME: Use self definition style component to render
// import { FieldLabel } from '../../../../NetworkForm/styledComponents'

import { CommonActionSettings } from './CommonActionSettings'


export function DisplayMessageSetting () {
  const { $t } = useIntl()


  return (<>
    <CommonActionSettings actionType={ActionType.DISPLAY_MESSAGE} />
    <Form.Item
      name={'title'}
      label={$t({ defaultMessage: 'Page Title' })}
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
      hidden={true}
    />

    <Form.Item
      name={'continueButtonText'}
      hidden={true}
    />
    <Form.Item
      name={'displayBackButton'}
      hidden={true}
    />
    <Form.Item
      name={'displayContinueButton'}
      hidden={true}
    />
  </>)
}
