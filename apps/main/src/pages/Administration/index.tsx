import { useIntl } from 'react-intl'

import { PageHeader }                            from '@acx-ui/components'
import { Tabs }                                  from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import AccountSettings from './AccountSettings'
import Administrators  from './Administrators'
import FWVersionMgmt   from './FWVersionMgmt'
import Notifications   from './Notifications'
import Subscriptions   from './Subscriptions'


const AdministrationTabs = () => {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const basePath = useTenantLink('/administration')
  const navigate = useNavigate()

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='accountSettings'
      activeKey={activeTab}
      onChange={onTabChange}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Account Settings' })} key='accountSettings' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Administrators' })} key='administrators' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Notifications' })} key='notifications' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Subscriptions' })} key='subscriptions' />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Firmware Version Management' })}
        key='fwVersionMgmt'
      />
    </Tabs>
  )
}

const tabPanes = {
  accountSettings: AccountSettings,
  administrators: Administrators,
  notifications: Notifications,
  subscriptions: Subscriptions,
  fwVersionMgmt: FWVersionMgmt
}

export default function Administration () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const isEnable = useIsSplitOn(Features.UNRELEASED)

  if (!isEnable) {
    return <span>{ $t({ defaultMessage: 'Administration is not enabled' }) }</span>
  }

  const ActiveTabPane = tabPanes[activeTab as keyof typeof tabPanes]

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Administration' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Administration' }), link: '/administration' }
      ]}
      footer={<AdministrationTabs />}
    />
    { ActiveTabPane && <ActiveTabPane /> }
  </>
}
