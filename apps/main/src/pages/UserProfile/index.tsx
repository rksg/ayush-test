import { Row, Col, Form, Select } from 'antd'
import { useIntl }                from 'react-intl'

import { PageHeader, StepsForm, Tabs, UserProfileSection } from '@acx-ui/components'
import { MultiFactor }                                     from '@acx-ui/msp/components'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { RolesEnum }         from '@acx-ui/types'
import {
  DetailLevel,
  UserProfile as UserProfileInterface,
  useUserProfileContext,
  useUpdateUserProfileMutation,
  roleStringMap,
  hasRoles,
  hasCrossVenuesPermission
} from '@acx-ui/user'

import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'
import {
  RecentLogin
} from './RecentLogin'

export function UserProfile () {
  const { $t } = useIntl()
  const { Option } = Select
  const { tenantId, activeTab } = useParams()
  const navigate = useNavigate()
  const { data: userProfile } = useUserProfileContext()
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const basePath = useTenantLink('/userprofile')

  const handleUpdateSettings = async (data: Partial<UserProfileInterface>) => {
    await updateUserProfile({ payload: data, params: { tenantId } })
    window.location.reload()
    navigate(-1)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const SettingsTab = () => {
    return (
      <StepsForm
        disabled={!hasCrossVenuesPermission()}
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
                  <Select disabled={!hasCrossVenuesPermission()}>
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
                  <Select disabled={!hasCrossVenuesPermission()}>
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
              <PreferredLanguageFormItem />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const SecurityTab = () => {
    return <MultiFactor/>
  }

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const tabs = [
    {
      key: 'settings',
      title: $t({ defaultMessage: 'Settings' }),
      component: <SettingsTab />
    },
    {
      key: 'security',
      title: $t({ defaultMessage: 'Security' }),
      component: <SecurityTab />
    },
    {
      key: 'recentLogins',
      title: $t({ defaultMessage: 'Recent Logins' }),
      disabled: hasRoles([RolesEnum.DPSK_ADMIN]),
      component: userProfile && <RecentLogin userEmail={userProfile!.email} />
    }
  ]

  const ActiveTabPane = tabs.find(({ key }) => key === activeTab)?.component

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'User Profile' })}
      />
      <UserProfileSection
        userProfile={userProfile}
        tenantId={tenantId}
        roleStringMap={roleStringMap}
      />

      <Tabs
        defaultActiveKey='settings'
        activeKey={activeTab}
        onChange={onTabChange}
      >
        {tabs.map(({ key, title, disabled }) =>
          <Tabs.TabPane tab={title} key={key} disabled={disabled} />)}
      </Tabs>
      {ActiveTabPane}
    </>
  )
}
