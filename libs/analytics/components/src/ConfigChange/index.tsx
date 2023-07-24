import { useState } from 'react'

import { Button, Menu, MenuProps, Space } from 'antd'
import { ItemType }                       from 'antd/lib/menu/hooks/useItems'
import { useIntl }                        from 'react-intl'

import { GridRow, GridCol, Dropdown, CaretDownSolidIcon } from '@acx-ui/components'
import { get }                                            from '@acx-ui/config'
import { DateRange, dateRangeMap }                        from '@acx-ui/utils'

import { NetworkFilter } from '../NetworkFilter'

import { Chart }                from './Chart'
import { ConfigChangeProvider } from './context'
import { KPIs }                 from './KPI'
import { Table }                from './Table'

export function useConfigChange () {
  const { $t } = useIntl()
  const [ dateRange, setDateRange ] = useState<DateRange>(DateRange.last7Days)
  const handleMenuClick: MenuProps['onClick'] = (e) => setDateRange(e.key as DateRange)

  const headerExtra = [
    <NetworkFilter
      key='network-filter'
      shouldQuerySwitch={true}
      withIncidents={false}
    />,
    <Dropdown
      key='date-dropdown'
      overlay={<Menu
        onClick={handleMenuClick}
        items={[DateRange.last7Days, DateRange.last30Days
        ].map((key)=>({ key, label: $t(dateRangeMap[key]) })) as ItemType[]}
      />}>{() =>
        <Button>
          <Space>
            {dateRange}
            <CaretDownSolidIcon />
          </Space>
        </Button>
      }</Dropdown>
  ]

  const component = <ConfigChangeProvider dateRange={dateRange} setDateRange={setDateRange}>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: get('IS_MLISA_SA') ? '200px' : '170px' }}>
        <Chart/>
      </GridCol>
      <GridCol col={{ span: 8 }}><KPIs/></GridCol>
      <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}><Table/></GridCol>
    </GridRow>
  </ConfigChangeProvider>

  return { headerExtra, component }
}
