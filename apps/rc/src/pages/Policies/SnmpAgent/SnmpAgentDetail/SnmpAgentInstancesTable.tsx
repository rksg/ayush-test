import { useState } from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Table, TableProps, Card, Loader, Tabs }               from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { useGetApUsageByApSnmpQuery }                          from '@acx-ui/rc/services'
import { ApSnmpApUsage, defaultSort, sortProp, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                          from '@acx-ui/react-router-dom'
import { noDataDisplay }                                       from '@acx-ui/utils'


const RadioLable = styled.div`
  display: flex;
  justify-content: center;
`

export default function SnmpAgentInstancesTable () {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const [currentTab, setCurrentTab] = useState('venue')


  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useGetApUsageByApSnmpQuery,
    enableRbac: isUseRbacApi,
    defaultPayload: {
      page: 1,
      pageSize: 25,
      searchString: ''
    },
    sorter: {
      sortField: 'venueName',
      sortOrder: 'DESC'
    }
  })

  const columnsForVenueTable: TableProps<ApSnmpApUsage>['columns'] = [
    {
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular> Name' }),
      dataIndex: 'venueName',
      searchable: true,
      sorter: { compare: sortProp('venueName', defaultSort) },
      defaultSortOrder: 'descend',
      render: (_, row, __, highlightFn) => {
        const { venueName, venueId } = row
        return (!venueName? noDataDisplay :
          <TenantLink to={`/venues/${venueId}/venue-details/overview`}>
            {highlightFn(venueName)}
          </TenantLink>
        )
      }
    }
  ]


  const columnsForApTable: TableProps<ApSnmpApUsage>['columns'] = [
    {
      key: 'apName',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'apName',
      searchable: true,
      sorter: { compare: sortProp('apName', defaultSort) },
      render: function (_, row, __, highlightFn) {
        const { apName, apId } = row
        return (!apName? noDataDisplay :
          <TenantLink to={`/devices/wifi/${apId}/details/overview`}>
            {highlightFn(apName)}
          </TenantLink>
        )
      }
    },
    ...columnsForVenueTable
  ]

  return (
    <Loader states={[tableQuery]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count: tableQuery.data?.totalCount })}>

        <Tabs onChange={(tab: string) => { setCurrentTab(tab) }}
          activeKey={currentTab}
          type='third'
        >
          <Tabs.TabPane key='venue'
            tab={<RadioLable style={{ width: '36px' }}>
              {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}</RadioLable>}/>
          <Tabs.TabPane key='ap'
            tab={<RadioLable style={{ width: '36px' }}>
              {$t({ defaultMessage: 'AP' })}</RadioLable>}/>
        </Tabs>
        <div style={{
          display: currentTab === 'venue' ? 'block' : 'none'
        }}>
          <Table
            columns={columnsForVenueTable}
            pagination={tableQuery.pagination}
            onChange={isUseRbacApi? undefined : tableQuery.handleTableChange}
            dataSource={tableQuery.data?.data}
            rowKey='apId'
          />
        </div>
        <div style={{
          display: currentTab === 'ap' ? 'block' : 'none'
        }}>
          <Table
            columns={columnsForApTable}
            pagination={tableQuery.pagination}
            onChange={isUseRbacApi? undefined : tableQuery.handleTableChange}
            dataSource={tableQuery.data?.data}
            rowKey='apId'
          />
        </div>
      </Card>
    </Loader>
  )
}
