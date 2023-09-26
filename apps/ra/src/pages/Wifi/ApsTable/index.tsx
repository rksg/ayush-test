import { useEffect, useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import { defineMessage, useIntl } from 'react-intl'

import { AP, useApListQuery }                     from '@acx-ui/analytics/services'
import { defaultSort, sortProp ,formattedPath }   from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip }             from '@acx-ui/components'
import { Dropdown, Button, CaretDownSolidIcon }   from '@acx-ui/components'
import { TenantLink }                             from '@acx-ui/react-router-dom'
import { DateRange, defaultRanges, dateRangeMap } from '@acx-ui/utils'


import {  Ul, Chevron, Li } from './styledComponents'
export default function useApsTable () {
  const { $t } = useIntl()

  const [ dateRange, setDateRange ] = useState<DateRange>(DateRange.last24Hours)
  const timeRanges = defaultRanges()[dateRange]!
  console.log('time range: ', timeRanges)

  const [ apsCount, setApsCount ] = useState(0)
  const pagination = { pageSize: 10, defaultPageSize: 10 }

  const results = useApListQuery({
    start: timeRanges[0].format(),
    end: timeRanges[1].format(),
    limit: 100,
    metric: 'traffic'
  })

  const count = results.data?.aps?.length || 0
  useEffect(() => {
    setApsCount(count)
  },[count])

  const title = defineMessage({
    defaultMessage: 'AP List {count, select, null {} other {({count})}}',
    description: 'Translation strings - AP List'
  })


  const handleClick: MenuProps['onClick'] = (e) => {
    setDateRange(e.key as DateRange)
  }
  const timeRangeDropDown = <Dropdown
    key='timerange-dropdown-1'
    overlay={<Menu
      onClick={handleClick}
      items={[DateRange.last24Hours, DateRange.last7Days, DateRange.last30Days
      ].map((key) => ({ key, label: $t(dateRangeMap[key]) })) as ItemType[]} />}>{() => <Button>
      <Space>
        {dateRange}
        <CaretDownSolidIcon />
      </Space>
    </Button>}
  </Dropdown>

  const extra = [timeRangeDropDown]

  const apTablecolumnHeaders: TableProps<AP>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      key: 'apName',
      width: 130,
      sorter: { compare: sortProp('apName', defaultSort) },
      render: (_, row : AP) => (
        <TenantLink to={`/wifi/${row.macAddress}/details/reports`}>
          {row.apName}</TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      key: 'mac',
      width: 130,
      sorter: { compare: sortProp('macAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'AP Model' }),
      dataIndex: 'apModel',
      key: 'apModel',
      width: 80,
      sorter: { compare: sortProp('apModel', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 100,

      sorter: { compare: sortProp('ipAddress', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      width: 90,
      dataIndex: 'version',
      key: 'version',

      sorter: { compare: sortProp('version', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Network' }),
      width: 450,
      dataIndex: 'networkPath',
      key: 'networkPath',
      render: (_, value ) => {
        const networkPath = value.networkPath.slice(0, -1)
        return <Tooltip placement='left' title={formattedPath(networkPath, 'Name')}>
          <Ul>
            {networkPath.map(({ name }, index) => [
              index !== 0 && <Chevron key={`ap-chevron-${index}`}>{'>'}</Chevron>,
              <Li key={`ap-li-${index}`}>{name}</Li>
            ])}
          </Ul>
        </Tooltip>
      },
      sorter: { compare: sortProp('networkPath', defaultSort) }
    }
  ]

  const component =
  <Table<AP>
    columns={apTablecolumnHeaders}
    //dataSource={apListResult as unknown as AP[]}
    dataSource={results.data?.aps as unknown as AP[]}
    pagination={pagination}
    settingsId='ap-search-table'
  />
  // <ApsTabContext.Provider value={{ setApsCount }}>
  //   <ApTable ref={apTableRef}
  //     searchable={true}
  //     filterables={{
  //       venueId: venueFilterOptions,
  //       deviceGroupId: apgroupFilterOptions
  //     }}
  //     rowSelection={{
  //       type: 'checkbox'
  //     }}
  //   />
  // </ApsTabContext.Provider>

  return {
    title: $t(title, { count: apsCount || 0 }),
    headerExtra: extra,
    component
  }
}
