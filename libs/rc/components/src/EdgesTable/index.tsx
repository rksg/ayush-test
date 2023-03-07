import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { useDeleteEdgeMutation, useGetEdgeListQuery, useSendOtpMutation }         from '@acx-ui/rc/services'
import { EdgeStatusEnum, EdgeStatus, useTableQuery, TABLE_QUERY, RequestPayload } from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink }                                 from '@acx-ui/react-router-dom'

import { EdgeStatusLight } from './EdgeStatusLight'

export { EdgeStatusLight } from './EdgeStatusLight'

export interface EdgesTableQueryProps
  extends Omit<TABLE_QUERY<EdgeStatus, RequestPayload<unknown>, unknown>, 'useQuery'>{}

interface EdgesTableProps extends Omit<TableProps<EdgeStatus>, 'columns'> {
  tableQuery?: EdgesTableQueryProps;
  filterColumns?: string[];  // use column key to filter them out
}

export const defaultEdgeTablePayload = {
  fields: [
    'name',
    'deviceStatus',
    'type',
    'model',
    'serialNumber',
    'ip',
    'ports',
    'venueId',
    'venueName',
    'edgeGroupId',
    'tags',
    'firmwareVersion'
  ],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC'
}

export const EdgesTable = (props: EdgesTableProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeListQuery,
    defaultPayload: defaultEdgeTablePayload,
    ...props.tableQuery
  })

  const [deleteEdge, { isLoading: isDeleteEdgeUpdating }] = useDeleteEdgeMutation()
  const [sendOtp] = useSendOtpMutation()

  const columns: TableProps<EdgeStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      tooltip: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return (
          <TenantLink to={`/devices/edge/${row.serialNumber}/edge-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'deviceStatus',
      dataIndex: 'deviceStatus',
      sorter: true,
      render: (data, row) => {
        return (
          <EdgeStatusLight data={row.deviceStatus} />
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Serial Number' }),
      key: 'serialNumber',
      dataIndex: 'serialNumber',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Ports' }),
      key: 'ports',
      dataIndex: 'ports',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venue',
      dataIndex: ['venueName'],
      sorter: true,
      render: (data, row) => {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Tags' }),
      key: 'tags',
      dataIndex: 'tags',
      sorter: true,
      render: (data) => {
        return `${data}`
      }
    },
    {
      title: $t({ defaultMessage: 'Version' }),
      key: 'firmwareVersion',
      dataIndex: 'firmwareVersion',
      sorter: true,
      show: false
    }
  ]

  if (props.filterColumns) {
    props.filterColumns.forEach((columnTofilter) => {
      _.remove(columns, { key: columnTofilter })
    })
  }

  const rowActions: TableProps<EdgeStatus>['rowActions'] = [
    {
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        navigate({
          ...basePath,
          pathname:
          `${basePath.pathname}/devices/edge/${selectedRows[0].serialNumber}/edit/general-settings`
        })
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Edges' }),
            entityValue: rows.length === 1 ? rows[0].name : undefined,
            numOfEntities: rows.length
          },
          onOk: () => {
            rows.length === 1 ?
              deleteEdge({ params: { serialNumber: rows[0].serialNumber } })
                .then(clearSelection) :
              deleteEdge({ payload: rows.map(item => item.serialNumber) })
                .then(clearSelection)
          }
        })
      }
    },
    {
      visible: (selectedRows) => (selectedRows.length === 1 &&
        EdgeStatusEnum.NEVER_CONTACTED_CLOUD === selectedRows[0]?.deviceStatus),
      label: $t({ defaultMessage: 'Send OTP' }),
      onClick: (rows, clearSelection) => {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Send OTP' }),
          content: $t({ defaultMessage: 'Are you sure you want to send OTP?' }),
          onOk: () => {
            sendOtp({ params: { serialNumber: rows[0].serialNumber } })
              .then(clearSelection)
          }
        })
      }
    }
  ]

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false, isFetching: isDeleteEdgeUpdating }
    ]}>
      <Table
        {...props}
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='serialNumber'
        rowActions={rowActions}
      />
    </Loader>
  )
}