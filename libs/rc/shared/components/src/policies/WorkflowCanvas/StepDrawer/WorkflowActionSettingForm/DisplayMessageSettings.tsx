import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { ActionType, trailingNorLeadingSpaces } from '@acx-ui/rc/utils'

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
        { min: 2 },
        { max: 100 },
        { validator: (_, value) => trailingNorLeadingSpaces(value) }
      ]}
    >
      <Input placeholder={$t({ defaultMessage: 'Type your title here...' })}/>
    </Form.Item>

    <Form.Item
      name={'messageHtml'}
      label={$t({ defaultMessage: 'Page Body Text' })}
      rules={[
        { required: true, message: $t({ defaultMessage: 'Please enter page body text' }) },
        { min: 2 },
        { max: 1000 },
        { validator: (_, value) => trailingNorLeadingSpaces(value) }
      ]}
    >
      <Input.TextArea rows={8} placeholder={$t({ defaultMessage: 'Type your message here...' })}/>
    </Form.Item>

    <Form.Item
      name={'backButtonText'}
      hidden={true}
      children={<Input />}
    />

    <Form.Item
      name={'continueButtonText'}
      hidden={true}
      children={<Input />}
    />
    <Form.Item
      name={'displayBackButton'}
      hidden={true}
      children={<Input />}
    />
    <Form.Item
      name={'displayContinueButton'}
      hidden={true}
      children={<Input />}
    />
  </>)
}
