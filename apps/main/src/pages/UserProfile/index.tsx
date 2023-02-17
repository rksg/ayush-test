import { Row, Col, Form, Select, Typography }        from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Tabs,
  Tooltip
} from '@acx-ui/components'
import { useUserProfileContext }        from '@acx-ui/rc/components'
import { useUpdateUserProfileMutation } from '@acx-ui/rc/services'
import {
  DetailLevel,
  UserProfile as UserProfileInterface,
  RolesEnum
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'
import { notAvailableMsg } from '@acx-ui/utils'

import {
  RecentLogin
} from './RecentLogin'
import * as UI from './styledComponents'

interface fromLoc {
  from: string
}

const roleStringMap: Record<RolesEnum, MessageDescriptor> = {
  [RolesEnum.PRIME_ADMIN]: defineMessage({ defaultMessage: 'Prime Admin' }),
  [RolesEnum.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [RolesEnum.GUEST_MANAGER]: defineMessage({ defaultMessage: 'Guest Manager' }),
  [RolesEnum.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' })
}

export function UserProfile () {
  const { $t } = useIntl()
  const { Option } = Select
  const { Paragraph } = Typography
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const { data: userProfile } = useUserProfileContext()
  const location = useLocation().state as fromLoc

  const [updateUserProfile] = useUpdateUserProfileMutation()

  const handleUpdateSettings = async (data: Partial<UserProfileInterface>) => {
    await updateUserProfile({ payload: data, params: { tenantId } })
    navigate({
      pathname: location.from
    }, { replace: true })
  }

  const handleCancel = () => {
    navigate({
      pathname: location.from
    }, { replace: true })
  }

  const UserData = () => {
    return (
      <UI.UserDataWrapper>
        <UI.UserData>
          <UI.UserCircle>{userProfile?.initials}</UI.UserCircle>
          {userProfile && <div>
            <UI.UserName>{userProfile?.fullName}</UI.UserName>
            <UI.UserRole>
              {$t(roleStringMap[userProfile?.role])}
            </UI.UserRole>
            <UI.UserAttributes>
              <div>
                <b><UI.EnvelopClosedSolidIcon /></b>
                <Paragraph>{userProfile?.email}</Paragraph>
              </div>
              <div>
                <b>Tenant ID</b>
                <Paragraph copyable>{tenantId}</Paragraph>
              </div>
            </UI.UserAttributes>
          </div>}
        </UI.UserData>
      </UI.UserDataWrapper>
    )
  }

  const SettingsTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply Settings' }) }}
        onFinish={handleUpdateSettings}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                name='dateFormat'
                label={$t({ defaultMessage: 'Date Format' })}
                initialValue={userProfile?.dateFormat}
                children={
                  <Select>
                    <Option value={'mm/dd/yyyy'}>
                      {$t({ defaultMessage: 'MM/DD/YYYY' })}</Option>
                    <Option value={'dd/mm/yyyy'}>
                      {$t({ defaultMessage: 'DD/MM/YYYY' })}</Option>
                    <Option value={'yyyy/mm/dd'}>
                      {$t({ defaultMessage: 'YYYY/MM/DD' })}</Option>
                  </Select>
                }
              />
              <Form.Item
                name='detailLevel'
                label={$t({ defaultMessage: 'Event Details Level' })}
                initialValue={userProfile?.detailLevel}
                children={
                  <Select>
                    <Option value={DetailLevel.BASIC_USER}>
                      {$t({ defaultMessage: 'Basic User' })}</Option>
                    <Option value={DetailLevel.IT_PROFESSIONAL}>
                      {$t({ defaultMessage: 'IT Professional' })}</Option>
                    <Option value={DetailLevel.SUPER_USER}>
                      {$t({ defaultMessage: 'Super User' })}</Option>
                    <Option value={DetailLevel.DEBUGGING}>
                      {$t({ defaultMessage: 'Debugging' })}</Option>
                  </Select>
                }
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const SecurityTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onFinish={async () => handleCancel()}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <h4 ><b>{$t({ defaultMessage: 'Multi-Factor Authentication' })}</b></h4>

              <Form.Item style={{ marginTop: '15px' }}
                name='mfa_status'
                label={$t({ defaultMessage: 'Multi-Factor Authentication' })}
                tooltip={$t({ defaultMessage:
                  'This option is controlled by the Prime-Administrator(s) of this account.' +
                  'If they turn it on, you will be able to manage here your authentication ' +
                  'settings' })}
                rules={[{
                  required: false
                }]}
                children={
                  <h4>Off</h4>
                }
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  return (
    <>
      <PageHeader
        title='User Profile'
      />
      <UserData/>

      <Tabs defaultActiveKey={'Settings'}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Settings' })}
          key='Settings'>
          <SettingsTab />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Security' })}
          </Tooltip>}
          disabled={true}
          key='Security'>
          <SecurityTab />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Recent Logins' })}
          key='RecentLogins'>
          {userProfile && <RecentLogin userEmail={userProfile!.email} />}
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}
