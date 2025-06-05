import { useState } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { useAnalyticsFilter }                                                                     from '@acx-ui/analytics/utils'
import { Card, getDefaultEarliestStart, GridCol, GridRow, Loader, PageHeader, RangePicker, Tabs } from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink }                                                  from '@acx-ui/react-router-dom'
import { useDateFilter }                                                                          from '@acx-ui/utils'

import { VenueFilter } from './VenueFilter'
import { WifiClient }  from './Widgets/WifiClient'

const Mdu360: React.FC<{}> = () => {
  const { $t } = useIntl()
  const basePath = useTenantLink('/mdu360', 'v')
  const navigate = useNavigate()
  const { activeTab } = useParams()
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])
  const { startDate, endDate, setDateFilter, range } = useDateFilter({
    showResetMsg: true, earliestStart: getDefaultEarliestStart() })
  const { filters } = useAnalyticsFilter()

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Loader>
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
      />
      <Tabs onChange={onTabChange} activeKey={activeTab}>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Network Overview' })}
          key='networkOverview'
        />
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Resident Experience' })}
          key='residentExperience'
        >
          <GridRow>
            <GridCol col={{ span: 24 }} style={{ height: '179px' }}>
              <Card type='default'/>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
              <WifiClient filters={filters} />
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
              <Card type='default'/>
            </GridCol>
          </GridRow>
        </Tabs.TabPane>
      </Tabs>
    </Loader>
  )
}

export { Mdu360 }
