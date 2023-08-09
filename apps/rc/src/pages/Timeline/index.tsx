import moment                                        from 'moment-timezone'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { PageHeader, Tabs, RangePicker }         from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { TimelineTypes }                         from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                        from '@acx-ui/user'
import { useDateFilter }                         from '@acx-ui/utils'

import { Activities } from './Activities'
import { AdminLogs }  from './AdminLogs'
import { Events }     from './Events'

const tabs : {
  key: TimelineTypes,
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
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { activeTab = tabs[0].key } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/timeline')
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Administration' }) }
        ] : undefined}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            {tabs.map(({ key, title }) => <Tabs.TabPane tab={$t(title)} key={key} />)}
          </Tabs>
        }
        extra={filterByAccess([
          <RangePicker
            key='date-filter'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />
        ])}
      />
      {Tab && <Tab/>}
    </>
  )
}
export default Timeline
