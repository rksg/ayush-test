import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import { Subtitle  }   from '@acx-ui/components'
import { UserProfile } from '@acx-ui/user'

import * as UI from '../styledComponents'


export function UserNotifications (props: { profile: UserProfile }) {
  const { $t } = useIntl()
  const { profile } = props
  const [form] = Form.useForm()

  const NotificationPreference = () => {
    return (
      <Form
        form={form}
        layout='vertical'
        // onFinish={handleSubmit}
      >
        <Form.Item
          // eslint-disable-next-line max-len
          label={$t({ defaultMessage: 'All changes to Notification Preferences will override preferences previously set by the administrator.' })}
        />
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Delivery Preference' })}
        </Subtitle>

        <UI.FieldLabel width={'45px'}>
          <Form.Item
            name={'enableEmailNotifications'}
            initialValue={profile.preferredNotifications?.emailPreferences ?? false}
            valuePropName='checked'
            children={<Switch data-testid='enableEmailNotifications'/>}
          />
          <Space size={(12)} align='start'>
            { $t({ defaultMessage: 'Enable Email Nortifications' }) }
          </Space>
        </UI.FieldLabel>

        <UI.FieldLabel width={'45px'}>
          <Form.Item
            name={'enableSmsNotifications'}
            initialValue={profile.preferredNotifications?.smsPreferences ?? false}
            valuePropName='checked'
            children={<Switch data-testid='enableSmsNotifications'/>}
          />
          <Space align='start'>
            { $t({ defaultMessage: 'Enable SMS Notifications' }) }
          </Space>
        </UI.FieldLabel>
      </Form>
    )
  }

  return (
    <NotificationPreference />
  )
}
