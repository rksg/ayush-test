import { useRef } from 'react'

import { Col, Row }               from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useUpdatePreferencesMutation }                                               from '@acx-ui/analytics/services'
import { useRoles, getUserProfile }                                                   from '@acx-ui/analytics/utils'
import { PageHeader, StepsForm, Tabs, UserProfileSection as BasicUserProfileSection } from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }                                      from '@acx-ui/react-router-dom'
import { hasRaiPermission }                                                           from '@acx-ui/user'

import { NotificationSettings } from '../NotificationSettings'

import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'

interface Tab {
  key: ProfileTabEnum,
  title: string | JSX.Element,
  component?: JSX.Element,
  url?: string
}

export enum ProfileTabEnum {
  SETTINGS = 'settings',
  NOTIFICATIONS = 'notifications'
}

const UserProfileSection = () => {
  const { email, accountId, selectedTenant, firstName, lastName } = getUserProfile()
  const roles = useRoles()
  return <BasicUserProfileSection
    userProfile={{
      initials: `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`,
      fullName: `${firstName} ${lastName}`,
      role: selectedTenant?.role,
      email
    }}
    tenantId={accountId}
    roleStringMap={roles}/>
}

const SettingsTab = ({ navigate }: { navigate: () => void }) => {
  const { $t } = useIntl()
  const [ updatePreferences ] = useUpdatePreferencesMutation()
  const { userId } = getUserProfile()
  return (
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Apply Settings' }) }}
      onFinish={async (data: { preferredLanguage: string }) => {
        await updatePreferences({ userId, preferences: data })
        navigate()
        window.location.reload()
      }}
      onCancel={navigate}
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

// eslint-disable-next-line max-len
const intro = defineMessage({ defaultMessage: 'We\'ll always let you know about important changes, but pick what else you want to hear about.' })

const NotificationSettingsTab = ({ navigate }: { navigate: () => void }) => {
  const { $t } = useIntl()
  const { selectedTenant: { id } } = getUserProfile()
  const apply = useRef<() => Promise<boolean | void>>()
  return <>
    <div style={{ padding: '10px 0 20px' }}>{$t(intro)}</div>
    <StepsForm
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
      onFinish={async () => { if (await apply.current?.()) navigate() }}
      onCancel={navigate}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <NotificationSettings tenantId={id} apply={apply} />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  </>
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const defaultPage = useTenantLink('/')
  const navigateToDefaultPath = () => { navigate(defaultPage, { replace: true }) }
  const settingsTab = {
    key: ProfileTabEnum.SETTINGS,
    title: $t({ defaultMessage: 'Settings' }),
    component: <SettingsTab navigate={navigateToDefaultPath} />
  }
  const notificationsTab = {
    key: ProfileTabEnum.NOTIFICATIONS,
    title: $t({ defaultMessage: 'Notifications' }),
    component: <NotificationSettingsTab navigate={navigateToDefaultPath} />
  }
  return hasRaiPermission('READ_INCIDENTS')
    ? [ settingsTab, notificationsTab ]
    : [ settingsTab ]
}

export function Profile ({ tab }:{ tab?: ProfileTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const tabs = useTabs()
  const onTabChange = (tabKey: string) => {
    const tab = tabs.find(({ key }) => key === tabKey)
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
