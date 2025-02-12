import { useState } from 'react'

import { Col, Form, Space, Switch } from 'antd'
import { useIntl }                  from 'react-intl'

import { StepsForm, Subtitle  }                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                             from '@acx-ui/types'
import {
  hasRoles,
  UserProfile,
  useUpdateUserProfileMutation
} from '@acx-ui/user'

import * as UI from '../styledComponents'


export function UserNotifications (props: { profile: UserProfile }) {
  const { $t } = useIntl()
  const { profile } = props
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const [emailPreferences, setEmailPreferences] =
    useState(profile.preferredNotifications?.emailPreferences ?? false)
  const [smsPreferences, setSmsPreferences] =
    useState(profile.preferredNotifications?.smsPreferences ?? false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const rootPath = useTenantLink('/')

  const handleUpdateSettings = async () => {
    const payload: UserProfile = { ...profile, preferredNotifications: {
      emailPreferences: emailPreferences,
      smsPreferences: smsPreferences
    } }
    await updateUserProfile({ payload: payload, params: { tenantId } })
    window.location.reload()
    navigate(-1)
  }

  const handleCancel = () => {
    isGuestManager ?
      navigate({ pathname: rootPath.pathname }):
      navigate(-1)
  }

  const NotificationPreference = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
        layout='vertical'
        onFinish={handleUpdateSettings}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm>
          <UI.DescriptionWrapper>
            <Form.Item
              // eslint-disable-next-line max-len
              label={$t({ defaultMessage: 'All changes to Notification Preferences will override preferences previously set by the administrator.' })}
            />
          </UI.DescriptionWrapper>
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Delivery Preference' })}
          </Subtitle>

          <UI.FieldLabel width={'45px'}>
            <Col span={4}>
              <Switch data-testid='enableEmailNotification'
                checked={emailPreferences}
                onChange={setEmailPreferences}
              />
            </Col>
            <Space align='start'>
              { $t({ defaultMessage: 'Enable Email Notifications' }) }
            </Space>
          </UI.FieldLabel>

          <UI.FieldLabel width={'45px'}>
            <Col span={4}>
              <Switch data-testid='enableSmsNotification'
                checked={smsPreferences}
                onChange={setSmsPreferences}
              />
            </Col>
            <Space align='start'>
              { $t({ defaultMessage: 'Enable SMS Notifications' }) }
            </Space>
          </UI.FieldLabel>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  return (
    <NotificationPreference />
  )
}
