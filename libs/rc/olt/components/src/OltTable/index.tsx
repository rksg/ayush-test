import { Row }     from 'antd'
import { useIntl } from 'react-intl'

import { Table, TableProps, Loader }              from '@acx-ui/components'
import { Olt }                                    from '@acx-ui/olt/utils'
import { VenueLink }                              from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                         from '@acx-ui/user'

import { OltStatus }     from '../OltStatus'
import { useOltActions } from '../useOltActions'

interface OltTableProps {
  data?: Olt[]
  isLoading?: boolean
  isFetching?: boolean
}
const settingsId = 'olt-table'
export const OltTable = (props: OltTableProps) => {
  const { $t } = useIntl()
  const { data, isLoading = false, isFetching = false } = props

  const navigate = useNavigate()
  const linkToOLT = useTenantLink('/devices/optical/')
  const oltActions = useOltActions()

  const rowActions: TableProps<Olt>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows) => {
        const oltId = rows[0].serialNumber
        navigate(`${linkToOLT.pathname}/${oltId}/edit`, { replace: false })
      }
      // scopeKey:
    },
    {
      label: $t({ defaultMessage: 'Reboot Chassis' }),
      onClick: (rows, clearSelection) => {
        oltActions.showRebootOlt({ rows, callBack: clearSelection })
      }
      // scopeKey:
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        oltActions.showDeleteOlt({ rows, callBack: clearSelection })
      }
      // scopeKey:
    }
  ]

  const allowedRowActions = filterByAccess(rowActions)

  return <Loader states={[{ isLoading, isFetching }]}>
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

  const columns: TableProps<Olt>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Device Name' }),
    dataIndex: 'name',
    sorter: true,
    searchable: true,
    fixed: 'left',
    render: (_, row) => {
      return <TenantLink
        to={`/devices/optical/${row.serialNumber}/details`}
        style={{ lineHeight: '20px' }}
      >
        {row.name}
      </TenantLink>
    }
  }, {
    title: $t({ defaultMessage: 'Status' }),
    key: 'status',
    dataIndex: 'stauts',
    filterable: true,
    sorter: true,
    width: 80,
    render: (_, row) =>
      <Row>
        <OltStatus
          status={row.status}
          showText />
      </Row>
  }, {
    key: 'vendor',
    title: $t({ defaultMessage: 'Vendor' }),
    dataIndex: 'vendor',
    sorter: true,
    align: 'center'
  }, {
    key: 'model',
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    filterable: true,
    sorter: true
  }, {
    key: 'ip',
    title: $t({ defaultMessage: 'IP Address' }),
    dataIndex: 'ip',
    sorter: true
  }, {
    key: 'firmware',
    title: $t({ defaultMessage: 'Firmware Version' }),
    dataIndex: 'firmware',
    sorter: true
  }, {
    title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
    key: 'venueId',
    dataIndex: 'venueId',
    filterable: true,
    sorter: true,
    render: (_, row) => {
      return <VenueLink venueId={row.venueId} name={row.venueName}/>
    }
  }]

  return columns
}