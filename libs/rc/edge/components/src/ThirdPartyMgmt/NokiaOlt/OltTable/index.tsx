import { useState, forwardRef, useImperativeHandle } from 'react'

import { Row, Button } from 'antd'
import { omit }        from 'lodash'
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
  getOltStatusConfig,
  isOltValidSerialNumber,
  EdgeNokiaOltStatusEnum
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
    // {
    //   label: $t({ defaultMessage: 'Edit' }),
    //   onClick: (rows) => {
    //     setCurrentOlt(rows[0])
    //     setVisible(true)
    //   },
    //   scopeKey: getScopeKeyByService(ServiceType.EDGE_TNM_SERVICE, ServiceOperation.EDIT)
    // },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'OLT Device' }),
            // since we use radio selection, there will be only one row
            entityValue: rows[0].name,
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
        return <Button type='link'
          onClick={() => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/devices/optical/${row.serialNumber}/details`
            }, { state: omit(row, 'children') })
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
      render: (_, row) =>
        <Row>
          <EdgeNokiaOltStatus
            config={getOltStatusConfig()}
            status={row.status || EdgeNokiaOltStatusEnum.UNKNOWN}
            showText />
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