import { useState, forwardRef, useImperativeHandle } from 'react'

import { Row, Button } from 'antd'
import { useIntl }     from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  showActionModal
} from '@acx-ui/components'
import { useDeleteEdgeOltMutation } from '@acx-ui/rc/services'
import {
  ServiceType,
  ServiceOperation,
  getScopeKeyByService,
  filterByAccessForServicePolicyMutation,
  VenueLink,
  EdgeNokiaOltData,
  getOltStatusConfig
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeNokiaOltStatus } from '../OltStatus'

import { NokiaOltFormDrawer } from './OltFormDrawer'

interface EdgeNokiaOltTableProps {
  data?: EdgeNokiaOltData[]
  isLoading?: boolean
  isFetching?: boolean
}
const settingsId = 'edge-nokia-olt-table'
export const EdgeNokiaOltTable = forwardRef((props: EdgeNokiaOltTableProps, ref) => {
  const { $t } = useIntl()
  const { data, isLoading = false, isFetching = false } = props

  const [visible, setVisible] = useState<boolean>(false)
  const [currentOlt, setCurrentOlt] = useState<EdgeNokiaOltData | undefined>(undefined)

  const [deleteFn, { isLoading: isDeleting }] = useDeleteEdgeOltMutation()

  useImperativeHandle(ref, () => ({
    openAddDrawer: () => {
      setCurrentOlt(undefined)
      setVisible(true)
    }
  }))

  const rowActions: TableProps<EdgeNokiaOltData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows) => {
        setCurrentOlt(rows[0])
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
            entityName: $t({ defaultMessage: 'OLT Device' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({
              params: {
                venueId: row.venueId,
                edgeClusterId: row.edgeClusterId,
                oltId: row.id }
            }).unwrap())).then(clearSelection)
          }
        })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.DELETE)
    }
  ]

  const allowedRowActions = filterByAccessForServicePolicyMutation(rowActions)

  return <Loader states={[{ isLoading, isFetching: isFetching || isDeleting }]}>
    <Table
      rowKey='serialNumber'
      settingsId={settingsId}
      columns={useColumns()}
      dataSource={data}
      rowActions={allowedRowActions}
      rowSelection={{ type: 'radio' }}
    />
    <NokiaOltFormDrawer
      visible={visible}
      setVisible={setVisible}
      editData={currentOlt}
    />
  </Loader>
})

function useColumns () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const columns: TableProps<EdgeNokiaOltData>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      fixed: 'left',
      render: (_, row) => {
        // TODO: remove after IT done
        const mockData = {
          name: 'mwc_barcelona',
          status: 'online',
          vendor: 'Nokia',
          model: 'MF-2',
          firmware: '22.649',
          ip: '134.242.136.112',
          serialNumber: 'FH2408A0B5D'
        }

        return <Button type='link'
          onClick={() => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/devices/optical/${mockData.serialNumber}/details`
            }, { state: mockData })
          }}>
          {row.name}
        </Button>
      }
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
      align: 'center'
    },
    {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model'
    },
    {
      key: 'firmware',
      title: $t({ defaultMessage: 'Firmware Version' }),
      dataIndex: 'firmware'
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
        return <VenueLink venueId={row.venueId} name={row.venueName}/>
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