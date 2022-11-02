import React from 'react'

import {
  Loading3QuartersOutlined
} from '@ant-design/icons'
import { Badge, Space } from 'antd'
import { saveAs }       from 'file-saver'
import moment           from 'moment'
import { useIntl }      from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  deviceStatusColors,
  showActionModal,
  showToast,
  StackedBarChart,
  cssStr
} from '@acx-ui/components'
import {
  useApListQuery,
  useDeleteApMutation,
  useDownloadApLogMutation,
  useLazyGetDhcpApQuery,
  useRebootApMutation
} from '@acx-ui/rc/services'
import {
  ApDeviceStatusEnum,
  ApDhcpRoleEnum,
  ApExtraParams,
  AP,
  APMeshRole,
  APView,
  DeviceConnectionStatus,
  transformApStatus,
  transformDisplayNumber,
  transformDisplayText,
  useTableQuery
} from '@acx-ui/rc/utils'
import { getFilters }                         from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'


const defaultPayload = {
  searchString: '',
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData.APRadio.band', 'tags', 'serialNumber',
    'venueId', 'apStatusData.APRadio.radioId', 'apStatusData.APRadio.channel',
    'fwVersion'
  ]
}

const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}

const channelTitleMap: Record<keyof ApExtraParams, string> = {
  channel24: '2.4 GHz',
  channel50: '5 GHz',
  channelL50: 'LO 5 GHz',
  channelU50: 'HI 5 GHz',
  channel60: '6 GHz'
}

const transformMeshRole = (value: APMeshRole) => {
  let meshRole = ''
  switch (value) {
    case APMeshRole.EMAP:
      meshRole = 'eMAP'
      break
    case APMeshRole.DISABLED:
      meshRole = ''
      break
    default:
      meshRole = value
      break
  }
  return transformDisplayText(meshRole)
}

const APStatus = function ({ status }: { status: ApDeviceStatusEnum }) {
  const intl = useIntl()
  const apStatus = transformApStatus(intl, status, APView.AP_LIST)
  return (
    <span>
      <Badge color={handleStatusColor(apStatus.deviceStatus)}
        text={apStatus.message}
      />
    </span>
  )
}

export interface ApTableProps
  extends Omit<TableProps<AP>, 'columns'> {
}

export function ApTable (props?: ApTableProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const filters = getFilters(params)
  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters
    }
  })

  const [ downloadApLog ] = useDownloadApLogMutation()
  const [ getDhcpAp ] = useLazyGetDhcpApQuery()
  const [ rebootAp ] = useRebootApMutation()
  const [ deleteAp ] = useDeleteApMutation()

  const tableData = tableQuery.data?.data ?? []

  const columns = React.useMemo(() => {
    const extraParams = tableQuery.data?.extra ?? {
      channel24: true,
      channel50: false,
      channelL50: false,
      channelU50: false,
      channel60: false
    }

    return [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true,
      render: (data, row) => (
        <TenantLink to={`/devices/aps/${row.serialNumber}/details/overview`}>{data}</TenantLink>
      )
    }, {
      key: 'deviceStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      render: (status: unknown) => <APStatus status={status as ApDeviceStatusEnum} />
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    }, {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'IP'
    }, {
      key: 'apMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true
    }, {
      key: 'incidents',
      title: () => (
        <>
          { $t({ defaultMessage: 'Incidents' }) }
          <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
        </>
      ),
      dataIndex: 'incidents',
      sorter: false,
      render: (data, row) => {
        //TODO: Shows breakdown by severity - with a counter for each severity
        return (<Space direction='horizontal'>
          <StackedBarChart
            style={{ height: 10, width: 40 }}
            data={[{
              category: 'emptyStatus',
              series: [{
                name: '',
                value: 1
              }]
            }]}
            showTooltip={false}
            showLabels={false}
            showTotal={false}
            barColors={[cssStr(deviceStatusColors.empty)]}
          />
          <TenantLink to={`/devices/aps/${row.serialNumber}/details/incidents`}>{data ? data: 0}</TenantLink>
        </Space>)
      }
    }, {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      render: (data, row) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      )
    }, {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      render: (data, row) => {
        return (
          <TenantLink to={`/switches/${row.venueId}/details/overview`}>{data}</TenantLink>
        )
      }
    }, {
      key: 'meshRole',
      title: $t({ defaultMessage: 'Mesh Role' }),
      dataIndex: 'meshRole',
      sorter: true,
      render: transformMeshRole
    }, {
      key: 'clients',
      title: $t({ defaultMessage: 'Clients' }),
      // title: $t({ defaultMessage: 'Connected Clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: (data, row) => (
        <TenantLink to={`/aps/${row.serialNumber}/details/clients`}>
          {transformDisplayNumber(row.clients)}
        </TenantLink>
      )
    }, {
      key: 'deviceGroupName',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'deviceGroupName',
      sorter: true
      //TODO: Click-> Filter by AP group
    }, {
      key: 'rf-channels',
      title: $t({ defaultMessage: 'RF Channels' }),
      children: Object.entries(extraParams)
        .map(([channel, visible]) => visible ? {
          key: channel,
          dataIndex: channel,
          title: <Table.SubTitle children={channelTitleMap[channel as keyof ApExtraParams]} />,
          align: 'center',
          ellipsis: true,
          render: transformDisplayText
        } : null)
        .filter(Boolean)
    }, {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
      //TODO: Click-> Filter by Tag
    }, {
      key: 'serialNumber',
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      show: false,
      sorter: true
    }, {
      key: 'fwVersion',
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'fwVersion',
      show: false,
      sorter: true
    }] as TableProps<AP>['columns']
  }, [$t, tableQuery.data?.extra])


  const isActionVisible = (
    selectedRows: AP[],
    { selectOne, isOperational }: { selectOne?: boolean, isOperational?: boolean }) => {
    let visible = true
    if (isOperational) {
      visible = selectedRows.every(ap => ap.deviceStatus === ApDeviceStatusEnum.OPERATIONAL)
    }
    if (selectOne) {
      visible = visible && selectedRows.length === 1
    }
    return visible
  }

  const shouldShowConfirmation = (selectedRows: AP[]) => {
    return !selectedRows.every(selectedAp =>
      selectedAp.deviceStatus === ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD ||
      selectedAp.deviceStatus === ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD)
  }


  type DhcpApInfo = {
    serialNumber: string,
    dhcpApRole: ApDhcpRoleEnum,
    venueDhcpEnabled?: boolean
  }

  const rowActions: TableProps<AP>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      navigate(`/aps/${rows[0].serialNumber}/edit/details`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (rows, clearSelection) => {

      const dhcpAps = await getDhcpAp({
        params: { tenantId: params.tenantId },
        payload: rows.map(row => row.serialNumber)
      }, true).unwrap()

      if (dhcpAps && dhcpAps.response) {
        const res: DhcpApInfo[] = Array.isArray(dhcpAps.response)? dhcpAps.response : []
        const dhcpApMap = res.filter(dhcpAp =>
          dhcpAp.venueDhcpEnabled === true &&
          (dhcpAp.dhcpApRole === ApDhcpRoleEnum.PrimaryServer ||
            dhcpAp.dhcpApRole === ApDhcpRoleEnum.BackupServer))

        if (dhcpApMap.length > 0) {
          showActionModal({
            type: 'warning',
            content: $t({ defaultMessage: 'Not allow to delete DHCP APs' })
          })
          return
        }
      }

      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'AP' }),
          entityValue: rows.length === 1 ? rows[0].name : undefined,
          numOfEntities: rows.length,
          confirmationText: shouldShowConfirmation(rows) ? 'Delete' : undefined
        },
        onOk: () => {
          rows.length === 1 ?
            deleteAp({ params: { tenantId: params.tenantId, serialNumber: rows[0].serialNumber } })
              .then(clearSelection) :
            deleteAp({
              params: { tenantId: params.tenantId },
              payload: rows.map(row => row.serialNumber)
            }).then(clearSelection)
        }
      })
    }
  }, {
    label: $t({ defaultMessage: 'Reboot' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'CUSTOM_BUTTONS',
          buttons: [{
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Reboot' }),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler: () => {
              const serialNumber = rows[0].serialNumber
              rebootAp({ params: { tenantId: params.tenantId, serialNumber } })
              clearSelection()
            }
          }]
        },
        title: $t({ defaultMessage: 'Reboot Access Point?' }),
        content: $t({ defaultMessage: `Rebooting the AP will disconnect all connected clients.
          Are you sure you want to reboot?` })
      })
    }
  }, {
    label: $t({ defaultMessage: 'Download Log' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows) => {
      const toastKey = showToast({
        type: 'info',
        closable: false,
        extraContent: <div style={{ width: '60px' }}>
          <Loading3QuartersOutlined spin
            style={{ margin: 0, fontSize: '18px', color: cssStr('--acx-primary-white') }}/>
        </div>,
        content: $t({ defaultMessage: 'Preparing log...' })
      })

      const serialNumber = rows[0].serialNumber

      downloadApLog({ params: { tenantId: params.tenantId, serialNumber } })
        .unwrap().then((result) => {
          showToast({
            key: toastKey,
            type: 'success',
            content: $t({ defaultMessage: 'Log is ready.' })
          })

          const timeString = moment().format('DDMMYYYY-HHmm')
          saveAs(result.fileURL, `SupportLog_${serialNumber}_${timeString}.log.gz`) //TODO: CORS policy
        })
        .catch(() => {
          showToast({
            key: toastKey,
            type: 'error',
            content: $t({ defaultMessage: 'Failed to download AP support log.' })
          })
        })
    }
  }]

  return (
    <Loader states={[tableQuery]}>
      <Table<AP>
        {...props}
        columns={columns}
        dataSource={tableData}
        rowKey='serialNumber'
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={rowActions}
      />
    </Loader>
  )
}
