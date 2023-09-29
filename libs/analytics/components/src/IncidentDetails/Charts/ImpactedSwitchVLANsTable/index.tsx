import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Card, Loader, Table, TableProps } from '@acx-ui/components'

import {
  ImpactedSwitchPortRow,
  useImpactedSwitchVLANsQuery
} from './services'

import type { ChartProps } from '../types.d'

export function ImpactedSwitchVLANsTable ({ incident: { id } }: ChartProps) {
  const { $t, formatList } = useIntl()
  const response = useImpactedSwitchVLANsQuery({ id }, { selectFromResult: (response) => {
    const rows = response.data?.map((item) => {
      const vlans = item.mismatchedVlans
        .concat(item.mismatchedUntaggedVlan || [])
      return {
        ...item,
        mismatchedVlans: _.uniqBy(vlans, 'id').sort((a, b) => a.id - b.id)
      }
    })

    return { ...response, rows }
  } })

  const columns: TableProps<ImpactedSwitchPortRow>['columns'] = [{
    key: 'name',
    dataIndex: 'name',
    title: $t({ defaultMessage: 'Local Device' })
  }, {
    key: 'mac',
    dataIndex: 'mac',
    title: $t({ defaultMessage: 'Local Device MAC' })
  }, {
    key: 'portNumber',
    dataIndex: 'portNumber',
    title: $t({ defaultMessage: 'Port Number' })
  }, {
    key: 'mismatchedVlans',
    dataIndex: 'mismatchedVlans',
    title: $t({ defaultMessage: 'Mismatch VLAN' }),
    render: (_, row) => formatList(
      row.mismatchedVlans.map(v => v.id),
      { style: 'narrow', type: 'conjunction' }
    )
  }, {
    key: 'connectedDevicePort',
    dataIndex: ['connectedDevice', 'port'],
    title: $t({ defaultMessage: 'Peer Port' })
  }, {
    key: 'connectedDeviceName',
    dataIndex: ['connectedDevice', 'name'],
    title: $t({ defaultMessage: 'Peer Device' })
  }, {
    key: 'connectedDeviceMac',
    dataIndex: ['connectedDevice', 'mac'],
    title: $t({ defaultMessage: 'Peer Device MAC' })
  }]

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switches' })} type='no-border'>
      <Table
        columns={columns}
        dataSource={response.rows}
        pagination={{
          pageSize: response.rows?.length,
          hideOnSinglePage: true
        }}
      />
    </Card>
  </Loader>
}
