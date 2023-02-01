import React, { useEffect, useState } from 'react'

import { Switch, Row, Col } from 'antd'
import _                    from 'lodash'
import { useIntl }          from 'react-intl'

import {
  Loader,
  StepsForm,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useNetworkVenueListQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  Venue
} from '@acx-ui/rc/utils'

const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id',
    'description',
    'city',
    'country',
    'networks',
    'aggregatedApStatus',
    'radios',
    'aps',
    'activated',
    'vlan',
    'scheduling',
    'switches',
    'switchClients',
    'latitude',
    'longitude',
    'mesh',
    'status'
  ]
}

const defaultArray: Venue[] = []
/* eslint-disable max-len */

const getNetworkId = () => {
  //  Identify tenantId in browser URL
  // const parsedUrl = /\/networks\/([0-9a-f]*)/.exec(window.location.pathname)
  // Avoid breaking unit-tests even when browser URL has no tenantId.
  // if (Array.isArray(parsedUrl) && parsedUrl.length >= 1 && parsedUrl[1].length > 0) {
  //   return parsedUrl[1]
  // }
  return 'UNKNOWN-NETWORK-ID'
}

export function VenueSetting () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery({
    useQuery: useNetworkVenueListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)


  useEffect(()=>{
    if (tableQuery.data) {
      const data: React.SetStateAction<Venue[]> = []
      tableQuery.data.data.forEach(item => {
        const activatedVenue = item.deepVenue
        data.push({
          ...item,
          deepVenue: activatedVenue,
          // work around of read-only records from RTKQ
          activated: activatedVenue ? { isActivated: true } : { ...item.activated }
        })
      })
      setTableData(data)
    }
  }, [tableQuery.data])

  const activateNetwork = async () => {
    // TODO: Service
    // if (checked) {
    //   if (row.allApDisabled) {
    //     manageAPGroups(row);
    //   }
    // }
  }

  const rowActions: TableProps<Venue>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: () => {
      }
    },
    {
      label: $t({ defaultMessage: 'Deactivate' }),
      onClick: () => {
      }
    }
  ]

  const columns: TableProps<Venue>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'city',
      title: $t({ defaultMessage: 'City' }),
      dataIndex: 'city',
      sorter: true
    },
    {
      key: 'country',
      title: $t({ defaultMessage: 'Country' }),
      dataIndex: 'country',
      sorter: true
    },
    {
      key: 'switches',
      title: $t({ defaultMessage: 'Switches' }),
      dataIndex: 'switches',
      align: 'center',
      render: function (data) { return data ? data : 0 }
    },
    {
      key: 'activated',
      title: $t({ defaultMessage: 'Activated' }),
      dataIndex: ['activated', 'isActivated'],
      align: 'center',
      render: function (data, row) {
        return <Switch
          checked={Boolean(data)}
          onClick={(checked, event) => {
            event.stopPropagation()
          }}
        />
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery
    ]}>
      <Row gutter={20}>
        <Col span={20}>
          <StepsForm.Title children={$t({ defaultMessage: 'VLANs' })} />
          <Table
            rowKey='id'
            rowActions={rowActions}
            rowSelection={{
              type: 'checkbox'
            }}
            columns={columns}
            dataSource={tableData}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </Col>
      </Row>
    </Loader>
  )
}
