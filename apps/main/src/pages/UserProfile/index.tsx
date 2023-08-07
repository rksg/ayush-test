import { Row, Col, Form, Select, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { MultiFactor }            from '@acx-ui/msp/components'
import {
  useLocation,
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'
import {
  DetailLevel,
  UserProfile as UserProfileInterface,
  useUserProfileContext,
  useUpdateUserProfileMutation,
  roleStringMap
} from '@acx-ui/user'

import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'
import {
  RecentLogin
} from './RecentLogin'
import * as UI from './styledComponents'

interface fromLoc {
  from: string
}

export function UserProfile () {
  const { $t } = useIntl()
  const isI18n2 = useIsSplitOn(Features.I18N_PHASE2_TOGGLE)
  const { Option } = Select
  const { Paragraph } = Typography
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const { data: userProfile } = useUserProfileContext()
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const location = useLocation().state as fromLoc

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
              { isI18n2 && (
                <PreferredLanguageFormItem />
              )}
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const SecurityTab = () => {
    return <MultiFactor/>
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'User Profile' })}
      />
      <UserData/>

      <Tabs defaultActiveKey={'Settings'}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Settings' })}
          key='Settings'>
          <SettingsTab />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Security' })}
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
