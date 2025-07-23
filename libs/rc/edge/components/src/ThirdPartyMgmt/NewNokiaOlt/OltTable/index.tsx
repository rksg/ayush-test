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
  isOltValidSerialNumber
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeNewNokiaOltStatus } from '../OltStatus'


interface EdgeNokiaOltTableProps {
  data?: EdgeNokiaOltData[]
  isLoading?: boolean
  isFetching?: boolean
}
const settingsId = 'edge-nokia-olt-table'
export const EdgeNewNokiaOltTable = (props: EdgeNokiaOltTableProps) => {
  const { $t } = useIntl()
  const { data, isLoading = false, isFetching = false } = props

  const navigate = useNavigate()
  const linkToOLT = useTenantLink('/devices/optical/')
  const [deleteFn, { isLoading: isDeleting }] = useDeleteEdgeOltMutation()

  const rowActions: TableProps<EdgeNokiaOltData>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows) => {
        const oltId = rows[0].serialNumber || rows[0].ip //TODO: confirm with BE
        navigate(`${linkToOLT.pathname}/${oltId}/edit`, { replace: false })
      },
      scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.EDIT)
    },
    {
      label: $t({ defaultMessage: 'Reboot' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: rows.length === 1
            ? $t({ defaultMessage: 'Reboot "{name}"?' }, { name: rows[0].name }) //TODO: confirm with design
            : $t({ defaultMessage: 'Reboot "{num} OLT Devices"?' }, { num: rows.length }),
          content: rows.length === 1
            ? $t({ defaultMessage: 'Are you sure you want to reboot this OLT device?' })
            : $t({ defaultMessage: 'Are you sure you want to reboot these OLT devices?' }),
          okText: $t({ defaultMessage: 'Reboot' }),
          cancelText: $t({ defaultMessage: 'Cancel' }),
          onOk: () => {
            // Promise.all(rows.map(row => deleteFn({
            //   params: {
            //     venueId: row.venueId,
            //     edgeClusterId: row.edgeClusterId,
            //     // special case for OLT which has no serial number (ex: before it onboard to R1)
            //     oltId: isOltValidSerialNumber(row.serialNumber) ? row.serialNumber : row.ip }
            // }).unwrap())).then(clearSelection)
            clearSelection()
          }
        })
      }
      // scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.EDIT)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: rows.length === 1
              ? $t({ defaultMessage: 'OLT Device' })
              : $t({ defaultMessage: 'OLT Devices' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            Promise.all(rows.map(row => deleteFn({
              params: {
                venueId: row.venueId,
                edgeClusterId: row.edgeClusterId,
                // special case for OLT which has no serial number (ex: before it onboard to R1)
                oltId: isOltValidSerialNumber(row.serialNumber) ? row.serialNumber : row.ip }
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
      rowKey='ip'
      settingsId={settingsId}
      columns={useColumns()}
      dataSource={data}
      rowActions={allowedRowActions}
      rowSelection={{ type: 'checkbox' }}
    />
  </Loader>
}

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
        return <Button type='link'
          onClick={() => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/devices/optical/${row.serialNumber}/details`
            })
          }}>
          {row.name}
        </Button>
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'stauts',
      filterable: true,
      sorter: true,
      width: 80,
      render: (_, row) =>
        <Row>
          <EdgeNewNokiaOltStatus
            status={row.status}
            showText />
        </Row>
    },
    {
      key: 'vendor',
      title: $t({ defaultMessage: 'Vendor' }),
      dataIndex: 'vendor',
      sorter: true,
      align: 'center'
    },
    {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      filterable: true,
      sorter: true
    },
    {
      key: 'firmware',
      title: $t({ defaultMessage: 'Firmware Version' }),
      dataIndex: 'firmware',
      sorter: true
    },
    {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip',
      sorter: true
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      filterable: true,
      sorter: true,
      render: (_, row) => {
        return <VenueLink venueId={row.venueId} name={row.venueName}/>
      }
    },
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
      key: 'edgeClusterId',
      dataIndex: 'edgeClusterId',
      sorter: true,
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