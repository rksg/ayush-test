import { Col, Row }                                  from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { useUpdatePreferencesMutation }                                               from '@acx-ui/analytics/services'
import { getUserProfile }                                                             from '@acx-ui/analytics/utils'
import { PageHeader, StepsForm, Tabs, UserProfileSection as BasicUserProfileSection } from '@acx-ui/components'
import { useLocation, useNavigate, useParams, useTenantLink }                         from '@acx-ui/react-router-dom'

import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'

interface Tab {
  key: ProfileTabEnum,
  title: string | JSX.Element,
  component?: JSX.Element,
  url?: string
}

interface fromLoc {
  from: string
}

enum RolesEnum {
  ADMINISTRATOR = 'admin',
  REPORT_ONLY = 'report-only',
  NETWORK_ADMIN = 'network-admin'
}

export enum ProfileTabEnum {
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications'
}

const roleStringMap: Record<RolesEnum, MessageDescriptor> = {
  [RolesEnum.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
  [RolesEnum.REPORT_ONLY]: defineMessage({ defaultMessage: 'Report Only' }),
  [RolesEnum.NETWORK_ADMIN]: defineMessage({ defaultMessage: 'Network Manager' })
}

const UserProfileSection = () => {
  const { email, accountId, selectedTenant, firstName, lastName } = getUserProfile()
  return <BasicUserProfileSection
    userProfile={{
      initials: `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`,
      fullName: `${firstName} ${lastName}`,
      role: selectedTenant?.role,
      email
    }}
    tenantId={accountId}
    roleStringMap={roleStringMap}/>
}

const SettingsTab = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [ updatePreferences ] = useUpdatePreferencesMutation()
  const location = useLocation().state as fromLoc
  const dashboardPath = useTenantLink('/dashboard')
  const backPathname = location?.from ?? dashboardPath.pathname
  const { userId } = getUserProfile()

  return (
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply Settings' }) }}
      onFinish={async (data: { preferredLanguage: string }) => {
        await updatePreferences({ userId, preferences: data }).then(()=>{
          navigate({ pathname: backPathname }, { replace: true })
          window.location.reload()
        })
      }}
      onCancel={() => navigate({ pathname: backPathname }, { replace: true })}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <PreferredLanguageFormItem />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  )
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const settingsTab = {
    key: ProfileTabEnum.SETTINGS,
    title: $t({ defaultMessage: 'Settings' }),
    component: <SettingsTab />
  }
  const notificationsTab = {
    key: ProfileTabEnum.NOTIFICATIONS,
    title: $t({ defaultMessage: 'Notifications' }),
    url: '/analytics/profile/settings'
  }
  return [ settingsTab, notificationsTab ]
}

export function Profile ({ tab }:{ tab?: ProfileTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const tabs = useTabs()
  const onTabChange = (tabKey: string) => {
    const tab = tabs.find(({ key }) => key === tabKey)
    if (tab?.url) {
      window.open(tab.url, '_blank')
      return
    }
    tab && navigate({
      ...basePath,
      pathname: `${basePath.pathname}/profile/${tab.key}`
    })
  }
  const { activeTab } = useParams()
  const tabEnumKey = activeTab?.toUpperCase() as string
  if (!tab) {
    tab = ProfileTabEnum[tabEnumKey as keyof typeof ProfileTabEnum]
  }
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'My Profile' })}
    />
    <UserProfileSection />
    {tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
      {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
    </Tabs>}
    {TabComp}
  </>
}
