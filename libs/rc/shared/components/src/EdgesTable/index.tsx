import { Badge }   from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  useGetEdgeListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  EdgeStatus,
  EdgeStatusEnum,
  TABLE_QUERY,
  TableQuery,
  usePollingTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RequestPayload }                         from '@acx-ui/types'
import { filterByAccess }                         from '@acx-ui/user'

import { seriesMappingAP } from '../DevicesWidget'
import { useEdgeActions }  from '../useEdgeActions'

import { EdgeStatusLight } from './EdgeStatusLight'
import { useExportCsv }    from './useExportCsv'

export { EdgeStatusLight } from './EdgeStatusLight'

export interface EdgesTableQueryProps
  extends Omit<TABLE_QUERY<EdgeStatus, RequestPayload<unknown>, unknown>, 'useQuery'>{}

interface EdgesTableProps extends Omit<TableProps<EdgeStatus>, 'columns'> {
  tableQuery?: EdgesTableQueryProps;
  // use column key to filter them out,
  // notice that this is only applied on defaultColumns
  filterColumns?: string[];
  // custom column is optional
  columns?: TableProps<EdgeStatus>['columns']
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
  ]
}
const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

export const EdgesTable = (props: EdgesTableProps) => {
  const {
    tableQuery: customTableQuery,
    columns,
    filterColumns,
    ...otherProps
  } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('')

  const tableQuery = usePollingTableQuery({
    useQuery: useGetEdgeListQuery,
    defaultPayload: defaultEdgeTablePayload,
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    },
    search: {
      searchTargetFields: ['name', 'serialNumber', 'ip']
    },
    ...customTableQuery
  })
  const statusFilterOptions = seriesMappingAP().map(({ key, name, color }) => ({
    key, value: name, label: <Badge color={color} text={name} />
  }))
  const { venueOptions = [] } = useVenuesListQuery(
    { payload: venueOptionsDefaultPayload }, {
      selectFromResult: ({ data }) => {
        return {
          venueOptions: data?.data.map(item => ({ value: item.name, key: item.id }))
        }
      }
    })

  const { deleteEdges, reboot, sendOtp } = useEdgeActions()
  // eslint-disable-next-line max-len
  const { exportCsv, disabled } = useExportCsv<EdgeStatus>(tableQuery as TableQuery<EdgeStatus, RequestPayload<unknown>, unknown>)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)

  const defaultColumns: TableProps<EdgeStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true,
      fixed: 'left',
      render: (data, row) => {
        return (
          <TenantLink to={`/devices/edge/${row.serialNumber}/details/overview`}>
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
      fixed: 'left',
      filterable: statusFilterOptions,
      filterKey: 'deviceStatusSeverity',
      render: (data, row) => {
        return (
          <EdgeStatusLight data={row.deviceStatus} showText={true} />
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
      sorter: true,
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: true,
      searchable: true
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
      filterable: venueOptions,
      filterKey: 'venueId',
      render: (data, row) => {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {data}
          </TenantLink>
        )
      }
    },
    // {
    //   title: $t({ defaultMessage: 'Tags' }),
    //   key: 'tags',
    //   dataIndex: 'tags',
    //   sorter: true,
    //   render: (data) => {
    //     return `${data}`
    //   }
    // },
    {
      title: $t({ defaultMessage: 'Version' }),
      key: 'firmwareVersion',
      dataIndex: 'firmwareVersion',
      sorter: true,
      show: false
    }
  ]

  if (filterColumns) {
    filterColumns.forEach((columnTofilter) => {
      _.remove(defaultColumns, { key: columnTofilter })
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
        deleteEdges(rows, clearSelection)
      }
    },
    {
      visible: (selectedRows) => (selectedRows.length === 1 &&
        EdgeStatusEnum.OPERATIONAL === selectedRows[0]?.deviceStatus),
      label: $t({ defaultMessage: 'Reboot' }),
      onClick: (rows, clearSelection) => {
        reboot(rows[0], clearSelection)
      }
    },
    {
      visible: (selectedRows) => (selectedRows.length === 1 &&
        EdgeStatusEnum.NEVER_CONTACTED_CLOUD === selectedRows[0]?.deviceStatus),
      label: $t({ defaultMessage: 'Send OTP' }),
      onClick: (rows, clearSelection) => {
        sendOtp(rows[0], clearSelection)
      }
    }
  ]
  return (
    <Loader states={[tableQuery]}>
      <Table
        settingsId='edges-table'
        rowKey='serialNumber'
        rowActions={filterByAccess(rowActions)}
        columns={columns ?? defaultColumns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter
        // eslint-disable-next-line max-len
        iconButton={(exportDevice && false) ? { icon: <DownloadOutlined />, disabled, onClick: exportCsv } : undefined}
        {...otherProps}
      />
    </Loader>
  )
}
