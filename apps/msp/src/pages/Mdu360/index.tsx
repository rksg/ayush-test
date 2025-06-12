import { useState } from 'react'

import Card        from 'antd/lib/card/Card'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  getDefaultEarliestStart,
  GridRow,
  GridCol,
  Loader,
  PageHeader,
  RangePicker,
  Tabs} from '@acx-ui/components'
import { VenueFilter }                           from '@acx-ui/main/components'
import { useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { useDateFilter }                         from '@acx-ui/utils'

import Mdu360Tabs from './Mdu360Tabs'
import { TrafficBy } from './Widgets/TrafficBy'

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
            // selectedVenues={selectedVenues}
            // setSelectedVenues={setSelectedVenues}
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
            <GridCol col={{ span: 12 }} style={{ height: '179px' }}>
              <Card/>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '179px' }}>
              <Card/>
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
              <TrafficBy filters={filters}/>
              {/* <WifiClient filters={filters} /> */}
            </GridCol>
            <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
              <Card/>
            </GridCol>
          </GridRow>
        </Tabs.TabPane>
      </Tabs>
    </Loader>
  )
}

export default Mdu360