import { Col, Row, Typography }                      from 'antd'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { getUserProfile }                                     from '@acx-ui/analytics/utils'
import { PageHeader, StepsForm, Tabs }                        from '@acx-ui/components'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'
import { useUpdateUserMutation }     from './services'
import * as UI                       from './styledComponents'

interface Tab {
  key: ProfileTabEnum,
  title: string | JSX.Element,
  component?: JSX.Element,
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

const UserData = () => {
  const { $t } = useIntl()
  const { email, accountId, selectedTenant, firstName, lastName } = getUserProfile()
  const { Paragraph } = Typography
  const initials = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
  const fullName = `${firstName} ${lastName}`
  const role = selectedTenant?.role as RolesEnum

  return (
    <UI.UserDataWrapper>
      <UI.UserData>
        <UI.UserCircle>{initials}</UI.UserCircle>
        {<div>
          <UI.UserName>{fullName}</UI.UserName>
          <UI.UserRole>
            {$t(roleStringMap[role])}
          </UI.UserRole>
          <UI.UserAttributes>
            <div>
              <b><UI.EnvelopClosedSolidIcon /></b>
              <Paragraph>{email}</Paragraph>
            </div>
            <div>
              <b>Tenant ID</b>
              <Paragraph copyable>{accountId}</Paragraph>
            </div>
          </UI.UserAttributes>
        </div>}
      </UI.UserData>
    </UI.UserDataWrapper>
  )
}

const useTabs = () : Tab[] => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [ updateUser ] = useUpdateUserMutation()
  const location = useLocation().state as fromLoc
  const { userId } = getUserProfile()

  const handleUpdateSettings = async (data: { preferredLanguage: string }) => {
    await updateUser({ userId: userId ,preferences: data })
    navigate({
      pathname: location.from
    }, { replace: true })
    window.location.reload()
  }

  const handleCancel = () => {
    navigate({
      pathname: location.from
    }, { replace: true })
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
              <PreferredLanguageFormItem />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const settingsTab = {
    key: ProfileTabEnum.SETTINGS,
    title: $t({ defaultMessage: 'Settings' }),
    component: <SettingsTab />
  }
  const notificationsTab = {
    key: ProfileTabEnum.NOTIFICATIONS,
    title: <UI.TabNewTabLink to={'/analytics/profile/settings'}>
      {$t({ defaultMessage: 'Notifications' })}</UI.TabNewTabLink>
  }

  return [
    settingsTab,
    notificationsTab
  ]
}

export function Profile ({ tab }:{ tab?: ProfileTabEnum }) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')
  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/profile/${tab}`
    })
  }
  const { activeTab } = useParams()
  const tabEnumKey = activeTab?.toUpperCase() as string
  if (!tab) {
    tab = ProfileTabEnum[tabEnumKey as keyof typeof ProfileTabEnum]
  }
  const tabs = useTabs()
  const TabComp = tabs.find(({ key }) => key === tab)?.component
  return <>
    <PageHeader
      title={$t({ defaultMessage: 'User Profile' })}
      footer={<>
        <UserData />
        {tabs.length > 1 && <Tabs activeKey={tab} onChange={onTabChange}>
          {tabs.map(({ key, title }) => <Tabs.TabPane tab={title} key={key} />)}
        </Tabs>}
      </>}
    />
    {TabComp}
  </>
}
