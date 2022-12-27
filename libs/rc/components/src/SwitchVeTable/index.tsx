import { Space }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Tooltip,
  Loader
} from '@acx-ui/components'
import { useGetSwitchRoutedListQuery, useGetVenueRoutedListQuery, useSwitchPortlistQuery } from '@acx-ui/rc/services'
import {
  getSwitchModel,
  isOperationalSwitch,
  SwitchPortViewModel,
  useTableQuery,
  VeViewModel
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import * as UI from './styledComponents'

const STACK_PORT_FIELD = 'SwitchPortStackingPortField'

export function SwitchVeTable ({ isVenueLevel } : {
  isVenueLevel: boolean
}) {
  const { $t } = useIntl()
  const { serialNumber } = useParams()


  const defaultPayload = {
    fields: [
      'portNumber',
      'id',
      'switchId',
      'clientVlan',
      'venueId',
      'deviceStatus',
      'veId',
      'syncedSwitchConfig',
      'defaultVlan',
      'veId',
      'vlanId',
      'name',
      'portType',
      'switchName',
      'ipAddress',
      'ipSubnetMask',
      'ingressAclName',
      'egressAclName']
  }


  const tableQuery = useTableQuery({
    useQuery: isVenueLevel ? useGetSwitchRoutedListQuery: useGetSwitchRoutedListQuery,
    defaultPayload,
    sorter: {
      sortField: 'veId',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<VeViewModel>['columns'] = [{
    key: 'veId',
    title: $t({ defaultMessage: 'VE' }),
    dataIndex: 'veId',
    sorter: true,
    render: function (data) {
      return `VE-${data}`
    }
  }, {
    key: 'vlanId',
    title: $t({ defaultMessage: 'VLAN ID' }),
    dataIndex: 'vlanId',
    sorter: true
  }, {
    key: 'name',
    title: $t({ defaultMessage: 'Name' }),
    dataIndex: 'name',
    sorter: true
  }, {
    key: 'portType',
    title: $t({ defaultMessage: 'Port Type' }),
    dataIndex: 'portType',
    sorter: true
  }, {
    key: 'switchName',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'switchName',
    sorter: true
  }, {
    key: 'ipAddress',
    title: $t({ defaultMessage: 'IP Address' }),
    dataIndex: 'ipAddress',
    sorter: true
  }, {
    key: 'ipSubnetMask',
    title: $t({ defaultMessage: 'IP Subnet Mask' }),
    dataIndex: 'ipSubnetMask',
    sorter: true
  }, {
    key: 'ingressAclName',
    title: $t({ defaultMessage: 'Ingress ACL' }),
    dataIndex: 'ingressAclName',
    sorter: true
  }, {
    key: 'egressAclName',
    title: $t({ defaultMessage: 'Egress ACL' }),
    dataIndex: 'egressAclName',
    sorter: true
  }]


  return <Loader states={[tableQuery]}>
    <Table
      columns={columns}
      dataSource={(tableQuery.data?.data)}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='portId'
      // TODO
      // rowActions={rowActions}
      // rowSelection={{
      //   type: 'checkbox',
      //   renderCell: (checked, record, index, originNode) => {
      //     return record?.inactiveRow
      //       ? <Tooltip title={record?.inactiveTooltip}>{originNode}</Tooltip>
      //       : originNode
      //   },
      //   getCheckboxProps: (record) => {
      //     return {
      //       disabled: record?.inactiveRow
      //     }
      //   }
      // }}
      // actions={!isVenueLevel
      //   ? [{
      //     label: $t({ defaultMessage: 'Manage LAG' }),
      //     onClick: () => {}
      //   }]
      //   : []
      // }
    />
  </Loader>
}

