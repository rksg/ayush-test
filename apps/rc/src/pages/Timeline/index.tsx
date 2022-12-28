import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader, Tabs }                      from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { Activities } from './Activities'
import { AdminLogs }  from './AdminLogs'
import { Events }     from './Events'

type TimelineTabs = 'activities' | 'events' | 'adminLogs'

const tabs : {
  key: TimelineTabs,
  title: MessageDescriptor,
  component: () => JSX.Element
}[] = [
  {
    key: 'activities',
    title: defineMessage({ defaultMessage: 'Activities' }),
    component: Activities
  },
  {
    key: 'events',
    title: defineMessage({ defaultMessage: 'Events' }),
    component: Events
  },
  {
    key: 'adminLogs',
    title: defineMessage({ defaultMessage: 'Admin Logs' }),
    component: AdminLogs
  }
]

function Timeline () {
  const { $t } = useIntl()
  const { activeTab = tabs[0].key } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/timeline')
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  const Tab = tabs.find(tab => tab.key === activeTab)?.component
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Timeline' })}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {tabs.map(({ key, title }) => <Tabs.TabPane tab={$t(title)} key={key} />)}
          </Tabs>
        }
      />
      {Tab && <Tab/>}
    </>
  )
}
export default Timeline
