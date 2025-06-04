import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { getDefaultEarliestStart, PageHeader, RangePicker, Tabs } from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }                  from '@acx-ui/react-router-dom'
import { useDateFilter }                                          from '@acx-ui/utils'

import { VenueFilter } from './VenueFilter'

const Mdu360: React.FC<{}> = () => {
  const { $t } = useIntl()
  const basePath = useTenantLink('/mdu360', 'v')
  const navigate = useNavigate()
  const { activeTab } = useParams()
  const [selectedVenues, setSelectedVenues] = useState<string[]>([''])
  const { startDate, endDate, setDateFilter, range } = useDateFilter({
    showResetMsg: true, earliestStart: getDefaultEarliestStart() })

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <PageHeader
      title={$t({ defaultMessage: 'MDU 360' })}
      extra={[
        <VenueFilter
          selectedVenues={selectedVenues}
          setSelectedVenues={setSelectedVenues}
        />,
        <RangePicker
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
          maxMonthRange={3} //TODO: check
        />
      ]}
      footer={<Tabs onChange={onTabChange} activeKey={activeTab}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Network Overview' })}
          key='networkOverview'
        />

        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Resident Experience' })}
          key='residentExperience'
        />
      </Tabs>}
    />
  )
}

export { Mdu360 }