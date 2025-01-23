import { useState } from 'react'

import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import {
  ServiceType,
  ServiceOperation,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  VenueLink
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { EdgeNokiaOltStatus } from '../OltStatus/OltStatus'

import { NokiaOltCreateFormDrawer } from './OltCreateFormDrawer'
// import * as UI                      from './styledComponents'

const settingsId = 'edge-nokia-olt-table'
export function EdgeNokiaOltTable () {
  const { $t } = useIntl()
  const [visible, setVisible] = useState<boolean>(false)

  const rowActions: TableProps<EdgeNokiaOltData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows, clearSelection) => {
        setVisible(true)
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.EDIT)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edge Thirdparty Network Management Service' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({
              params: { edgeClusterId: row.id, venueId: row.venueId } }).unwrap()))
              .then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.DELETE)
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return <><Loader states={[{ isLoading, isFetching: isFetching || isDeleting }]}>
    <Table
      rowKey='id'
      settingsId={settingsId}
      columns={useColumns()}
      dataSource={data}
      rowActions={allowedRowActions}
      rowSelection={{ type: 'radio' }}
    />
  </Loader>
  <NokiaOltCreateFormDrawer
    visible={visible}
    setVisible={setVisible}
  />
  </>
}

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<EdgeNokiaOltData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) =>
        <TenantLink to={`devices/optical/${row.id}/details`}>
          {row.name}
        </TenantLink>
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'stauts',
      width: 80,
      align: 'center',
      render: (_, row) =>
        <Row justify='center'>
          <EdgeNokiaOltStatus config={getOltStatusConfig()} status={row.status} />
        </Row>
    },
    {
      key: 'vendor',
      title: $t({ defaultMessage: 'Vendor' }),
      dataIndex: 'vendor',
      align: 'center',
      sorter: true,
      render: (_, row) => row.vendor
    },
    {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model'
    },
    {
      key: 'firmwareVersion',
      title: $t({ defaultMessage: 'Firmware Version' }),
      dataIndex: 'firmwareVersion'
    },
    {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      render: (_, row) => {
        return <VenueLink venueId={row.tunneledWlans.venueId} name={row.tunneledWlans.venueName}/>
      }
    },
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'edgeClusterId',
      dataIndex: 'edgeClusterId',
      render: (_, row) => {
        return <TenantLink
          to={`devices/edge/cluster/${row.edgeClusterId}/edit/cluster-details`}
        >
          {row.edgeClusterName}
        </TenantLink>
      }
    }
  ]

  return columns
}