import moment                     from 'moment-timezone'
import { defineMessage, useIntl } from 'react-intl'

import { PageHeader, Tabs, RangePicker, getDefaultEarliestStart } from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink }                  from '@acx-ui/react-router-dom'
import { goToNotFound }                                           from '@acx-ui/user'
import { useDateFilter }                                          from '@acx-ui/utils'

import { Activities } from './Activities'
import { AdminLogs }  from './AdminLogs'
import { Events }     from './Events'

function Timeline () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/timeline')
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const earliestStart = showResetMsg ?
    moment().subtract(3, 'month').startOf('day'):
    getDefaultEarliestStart()
  const { startDate, endDate, setDateFilter, range } =
    useDateFilter({ earliestStart, showResetMsg })

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const tabs = {
    activities: () => <Activities />,
    events: () => <Events />,
    adminLogs: () => <AdminLogs />
  }
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Timeline' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Administration' }) }]}
        footer={
          <Tabs activeKey={activeTab} onChange={onTabChange}>
            <Tabs.TabPane key={'activities'}
              tab={$t(defineMessage({ defaultMessage: 'Activities' }))} />
            <Tabs.TabPane key={'events'}
              tab={$t(defineMessage({ defaultMessage: 'Events' }))} />
            <Tabs.TabPane key={'adminLogs'}
              tab={$t(defineMessage({ defaultMessage: 'Admin Logs' }))} />
          </Tabs>
        }
        extra={[
          <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
            allowedMonthRange={showResetMsg ? 3 : undefined}
            maxMonthRange={isDateRangeLimit ? 1 : 3}
          />
        ]}
      />
      {Tab && <Tab/>}
    </>
  )
}
export default Timeline
