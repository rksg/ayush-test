import { useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import { useIntl }                from 'react-intl'

import { GridRow, GridCol, Dropdown, Button, CaretDownSolidIcon } from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { getShowWithoutRbacCheckKey }                             from '@acx-ui/user'
import { DateRange, dateRangeMap, defaultRanges }                 from '@acx-ui/utils'

import { NetworkFilter } from '../NetworkFilter'

import { Chart } from './Chart'
import { KPIs }  from './KPI'
import { Table } from './Table'

export function useConfigChange () {
  const { $t } = useIntl()
  const [kpiTimeRanges, setKpiTimeRanges] = useState<number[][]>([])
  const [dateRange, setDateRange] = useState(DateRange.last7Days)

  const timeRanges = defaultRanges()[dateRange]
  const handleMenuClick: MenuProps['onClick'] = (e) => setDateRange(e.key as DateRange)

  const headerExtra = [
    <NetworkFilter
      key={getShowWithoutRbacCheckKey('network-filter')}
      shouldQuerySwitch={true}
      withIncidents={false}
    />,
    <Dropdown
      key={getShowWithoutRbacCheckKey('date-dropdown')}
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

  const component = <GridRow>
    <GridCol col={{ span: 24 }} style={{ minHeight: get('IS_MLISA_SA') ? '200px' : '170px' }}>
      <Chart timeRanges={timeRanges!} onBrushPositionsChange={setKpiTimeRanges}/>
    </GridCol>
    <GridCol col={{ span: 8 }}><KPIs kpiTimeRanges={kpiTimeRanges}/></GridCol>
    <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}>
      <Table timeRanges={timeRanges!}/>
    </GridCol>
  </GridRow>

  return { headerExtra, component }
}
