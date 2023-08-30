import { useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import { useIntl }                from 'react-intl'

import type { ConfigChange as ConfigChangeType }                  from '@acx-ui/components'
import { GridRow, GridCol, Dropdown, Button, CaretDownSolidIcon } from '@acx-ui/components'
import { get }                                                    from '@acx-ui/config'
import { getShowWithoutRbacCheckKey }                             from '@acx-ui/user'
import { DateRange, dateRangeMap }                                from '@acx-ui/utils'

import { NetworkFilter } from '../NetworkFilter'

import { Chart }                from './Chart'
import { ConfigChangeProvider } from './context'
import { KPIs }                 from './KPI'
import { Table }                from './Table'

export function useConfigChange () {
  const { $t } = useIntl()
  const [selected, setSelected] = useState<ConfigChangeType | null >(null)
  const [dotSelect, setDotSelect] = useState<number | null>(null)
  const [chartZoom, setChartZoom] = useState<{ start: number, end: number } | undefined>(undefined)
  const [legend, setLegend] = useState<Record<string, boolean>>({})
  const [initialZoom, setInitialZoom] = useState<{
    start: number, end: number } | undefined>(undefined)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })
  const [ dateRange, setDateRange ] = useState<DateRange>(DateRange.last7Days)

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setPagination({
      current: 1,
      pageSize: 10
    })
    setSelected(null)
    setDateRange(e.key as DateRange)
  }

  const onDotClick = (params: ConfigChangeType) => {
    setSelected(params)
    setDotSelect(selected?.id ?? null)
    setPagination((prevPagination) => ({
      ...prevPagination,
      current: Math.ceil((params.id! + 1) / prevPagination.pageSize)
    }))
  }
  const onRowClick = (params: ConfigChangeType) => {
    setSelected(params)
    setChartZoom(initialZoom)
  }

  const reverse = {
    zone: 'Zone',
    ap: 'AP',
    apGroup: 'AP Group',
    wlan: 'WLAN',
    wlanGroup: 'WLAN Group'
  }

  const convertedLegend: Record<string, boolean> = {}

  for (const [newKey, oldKey] of Object.entries(reverse)) {
    convertedLegend[newKey] = legend[oldKey]
  }

  const legendList = Object.keys(convertedLegend).filter(key => convertedLegend[key])

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

  const component = <ConfigChangeProvider dateRange={dateRange} setDateRange={setDateRange}>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ minHeight: get('IS_MLISA_SA') ? '200px' : '170px' }}>
        <Chart
          selected={selected}
          onClick={onDotClick}
          chartZoom={chartZoom}
          setChartZoom={setChartZoom}
          setInitialZoom={setInitialZoom}
          setLegend={setLegend}
          legend={legendList}
          setSelectedData={setSelected}
          setPagination={setPagination}
        />
      </GridCol>
      <GridCol col={{ span: 8 }}><KPIs/></GridCol>
      <GridCol col={{ span: 16 }} style={{ minHeight: '180px' }}>
        <Table
          selected={selected}
          onRowClick={onRowClick}
          pagination={pagination}
          setPagination={setPagination}
          dotSelect={dotSelect}
          legend={legendList}
        />
      </GridCol>
    </GridRow>
  </ConfigChangeProvider>

  return { headerExtra, component }
}
