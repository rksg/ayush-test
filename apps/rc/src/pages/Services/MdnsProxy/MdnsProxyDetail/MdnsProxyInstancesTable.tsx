import { Row, Col, Divider } from 'antd'
import { useIntl }           from 'react-intl'

import { Card, StepsForm, Table, TableProps } from '@acx-ui/components'
import { TenantLink }                         from '@acx-ui/react-router-dom'
import { formatter }                          from '@acx-ui/utils'


interface TxRxUnit {
  packets: number,
  bytes: number
}

interface TempAp {
  serialNumber: string,
  name: string,
  venueId: string,
  venueName: string,
  tx: TxRxUnit,
  rx: TxRxUnit,
  clientQueries: number,
  serverResponses: number,
  typesCount: number
}

export function MdnsProxyInstancesTable () {
  const { $t } = useIntl()
  const bytesFormatter = formatter('bytesFormat')

  const columns: TableProps<TempAp>['columns'] = [
    {
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (data) => {
        // TODO: should return a link which can navigate to the AP detail page
        return data
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      key: 'venueName',
      sorter: true,
      render: (data, row) => {
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Rx packets/bytes' }),
      dataIndex: 'rx',
      key: 'rx',
      sorter: true,
      render: (data, row) => {
        return (
          <>
            {row.rx.packets}
            <Divider type='vertical' />
            {bytesFormatter(row.rx.bytes)}
          </>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Tx packets/bytes' }),
      dataIndex: 'tx',
      key: 'tx',
      sorter: true,
      render: (data, row) => {
        return (
          <>
            {row.tx.packets}
            <Divider type='vertical' />
            {bytesFormatter(row.tx.bytes)}
          </>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Client queries' }),
      dataIndex: 'clientQueries',
      key: 'clientQueries',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Server responses' }),
      dataIndex: 'serverResponses',
      key: 'serverResponses',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Types of mDNS services' }),
      dataIndex: 'typesCount',
      key: 'typesCount',
      sorter: true
    }
  ]

  const dataSource: TempAp[] = [
    {
      serialNumber: '__AP_SERIAL__1',
      name: 'AP 1',
      venueId: '__VENUE_ID__1',
      venueName: 'Venue 1',
      rx: {
        packets: 1500,
        bytes: 15663
      },
      tx: {
        packets: 2500,
        bytes: 25663
      },
      clientQueries: 845,
      serverResponses: 373,
      typesCount: 3
    },
    {
      serialNumber: '__AP_SERIAL__2',
      name: 'AP 2',
      venueId: '__VENUE_ID__2',
      venueName: 'Venue 2',
      rx: {
        packets: 1600,
        bytes: 180663
      },
      tx: {
        packets: 2200,
        bytes: 2011663
      },
      clientQueries: 600,
      serverResponses: 500,
      typesCount: 3
    },
    {
      serialNumber: '__AP_SERIAL__3',
      name: 'AP 3',
      venueId: '__VENUE_ID__3',
      venueName: 'Venue 3',
      rx: {
        packets: 500,
        bytes: 5663
      },
      tx: {
        packets: 200,
        bytes: 2663
      },
      clientQueries: 10,
      serverResponses: 20,
      typesCount: 20
    }
  ]

  return (
    <Card>
      <Row gutter={[0, 16]} style={{ width: '100%' }}>
        <Col span={24}>
          <StepsForm.Title>
            {$t({ defaultMessage: 'Instances ({instanceCount})' }, { instanceCount: 3 })}
          </StepsForm.Title>
        </Col>
        <Col span={24}>
          <Table<TempAp>
            columns={columns}
            dataSource={dataSource}
            rowKey='serialNumber'
          />
        </Col>
      </Row>
    </Card>
  )
}
