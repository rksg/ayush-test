import { useState } from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { Table, TableProps, Card, Loader, Tabs } from '@acx-ui/components'
import { useGetApUsageByApSnmpQuery }            from '@acx-ui/rc/services'
import { ApSnmpApUsage, defaultSort, sortProp }  from '@acx-ui/rc/utils'
import { TenantLink }                            from '@acx-ui/react-router-dom'
import { noDataDisplay, useTableQuery }          from '@acx-ui/utils'


const RadioLabel = styled.div`
  display: flex;
  justify-content: center;
`

export default function SnmpAgentInstancesTable () {
  const [currentTab, setCurrentTab] = useState('venue')
  const { $t } = useIntl()
  const tableQueryForApActivation = useTableQuery({
    useQuery: useGetApUsageByApSnmpQuery,
    enableRbac: true,
    defaultPayload: {
      page: 1,
      pageSize: 25,
      searchString: '',
      searchForActivation: 'ap'
    },
    sorter: {
      sortField: 'venueName',
      sortOrder: 'DESC'
    }
  })

  const tableQueryForVenueActivation = useTableQuery({
    useQuery: useGetApUsageByApSnmpQuery,
    enableRbac: true,
    defaultPayload: {
      page: 1,
      pageSize: 25,
      searchString: '',
      searchForActivation: 'venue'
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
    <Loader states={[tableQueryForApActivation, tableQueryForVenueActivation]}>
      <Card title={$t({ defaultMessage: 'Instances ({count})' },
        { count:
            (tableQueryForApActivation.data?.totalCount ?? 0 ) +
            (tableQueryForVenueActivation.data?.totalCount ?? 0)
        })}
      >

        <Tabs onChange={(tab: string) => { setCurrentTab(tab) }}
          activeKey={currentTab}
          type='third'
        >
          <Tabs.TabPane key='venue'
            tab={<RadioLabel
              style={{ width: '36px' }}
              data-testid='venue-tab'>
              {$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}</RadioLabel>}/>
          <Tabs.TabPane key='ap'
            tab={<RadioLabel
              style={{ width: '36px' }}
              data-testid='ap-tab'>
              {$t({ defaultMessage: 'AP' })}</RadioLabel>}/>
        </Tabs>
        <div style={{
          display: currentTab === 'venue' ? 'block' : 'none'
        }}>
          <Table
            data-testid='venue-table'
            columns={columnsForVenueTable}
            pagination={tableQueryForVenueActivation.pagination}
            dataSource={tableQueryForVenueActivation.data?.data}
            rowKey='apId'
          />

        </div>
        <div style={{
          display: currentTab === 'ap' ? 'block' : 'none'
        }}>
          <Table
            data-testid='ap-table'
            columns={columnsForApTable}
            pagination={tableQueryForApActivation.pagination}
            dataSource={tableQueryForApActivation.data?.data}
            rowKey='apId'
          />
        </div>
      </Card>
    </Loader>
  )
}
