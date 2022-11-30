/* eslint-disable max-len */
import { FormattedMessage, useIntl } from 'react-intl'

import { Subtitle, Tooltip }                                           from '@acx-ui/components'
import { Table, TableProps, Loader }                                   from '@acx-ui/components'
import { useGetClientListQuery }                                       from '@acx-ui/rc/services'
import { ClientList, getDeviceTypeIcon, getOsTypeIcon, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }                                                  from '@acx-ui/react-router-dom'
import { formatter }                                                   from '@acx-ui/utils'

import * as UI from './styledComponents'
import { ClientHealthIcon } from '../ClientHealthIcon'

// TODO: userProfileService.userHasRole(user, 'OFFICE_ADMIN')
const hasGuestManagerRole = false 

function getCols (intl: ReturnType<typeof useIntl>, showAllColumns?: boolean) {
  const columns: TableProps<ClientList>['columns'] = [
    {
      key: 'hostname',
      title: intl.$t({ defaultMessage: 'Hostname' }),
      dataIndex: 'hostname',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (data, row) =>
        <TenantLink to={`users/aps/${row.clientMac}/details/overview`}>{data || '--'}</TenantLink>
    },
    {
      key: 'osType',
      title: intl.$t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      sorter: true,
      render: (data) => {
        return <UI.IconContainer>
          <Tooltip title={data}>
            { getOsTypeIcon(data as string) }
          </Tooltip>
        </UI.IconContainer>
      }
    },
    {
      key: 'healthCheckStatus',
      title: intl.$t({ defaultMessage: 'Health' }),
      dataIndex: 'healthCheckStatus',
      sorter: true,
      render: (data, row) => {
        return <Tooltip title={<FormattedMessage
          defaultMessage={`
              Client Health: {healthCheckStatus}<br></br>
              Reason: {healthStatusReason}<br></br>
              Since: {lastUpdateTime}
            `}
          values={{
            healthCheckStatus: row.healthCheckStatus,
            healthStatusReason: row.healthStatusReason,
            lastUpdateTime: formatter('dateTimeFormat')(row.lastUpdateTime),
            br: () => <br />
          }}
        />}>
          <ClientHealthIcon type={row.healthClass} />
        </Tooltip>
      }
    },
    {
      key: 'clientMac',
      title: intl.$t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: true,
      render: (data) => {
        return data || '--'
      }
    },
    {
      key: 'ipAddress',
      title: intl.$t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      render: (data) => {
        return data || '--'
      }
    },
    {
      key: 'Username',
      title: intl.$t({ defaultMessage: 'Username' }),
      dataIndex: 'Username',
      sorter: true,
      render: (data) => {
        return data || '--'
      }
    },
    {
      key: 'venueId',
      title: intl.$t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueId',
      render: (data, row) => {
        if(hasGuestManagerRole){
          return row.venueName
        }else{
          return (
            <TenantLink to={`/venues/${data}/venue-details/overview`}>{row.venueName}</TenantLink>
          )
        }
      }
    },
    {
      key: 'serialNumber',
      title: intl.$t({ defaultMessage: 'AP' }),
      dataIndex: 'serialNumber',
      render: (data, row) => {
        if(hasGuestManagerRole){
          return row.apName
        }else{
          return (
            <TenantLink to={`/devices/aps/${data}/details/overview`}>{row.apName}</TenantLink>
          )
        }
      }
    },
    {
      key: 'switchSerialNumber',
      title: intl.$t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchSerialNumber',
      render: (data, row) => {
        if(!row.switchName){
          return '--'
        }else{
          return (
            <TenantLink to={`/devices/switches/${data}/details/overview`}>{row.switchName}</TenantLink>
          )
        }
      }
    },
    {
      key: 'ssid',
      title: intl.$t({ defaultMessage: 'Network' }),
      dataIndex: 'ssid',
      sorter: true,
      render: (data, row) =>
        (
          <TenantLink to={`/networks/${row.networkId}/network-details/aps`}>{data}</TenantLink>
        )
    },
    {
      key: 'sessStartTime',
      title: intl.$t({ defaultMessage: 'Time Connected' }),
      dataIndex: 'sessStartTime',
      sorter: true,
      render: (data, row) => row.sessStartTimeString
    },
    {
      key: 'clientVlan',
      title: intl.$t({ defaultMessage: 'VLAN' }),
      dataIndex: 'clientVlan',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'deviceTypeStr',
      title: intl.$t({ defaultMessage: 'Device Type' }),
      dataIndex: 'deviceTypeStr',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => {
        return <UI.IconContainer>
          <Tooltip title={data}>
            {getDeviceTypeIcon(data as string)}
          </Tooltip>
        </UI.IconContainer>
      }
    },
    {
      key: 'modelName',
      title: intl.$t({ defaultMessage: 'Model Name' }),
      dataIndex: 'modelName',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'totalTraffic',
      title: intl.$t({ defaultMessage: 'Traffic (Session)' }),
      dataIndex: 'totalTraffic',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'trafficToClient',
      title: intl.$t({ defaultMessage: 'Traffic To Client' }),
      dataIndex: 'trafficToClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'trafficFromClient',
      title: intl.$t({ defaultMessage: 'Traffic From Client' }),
      dataIndex: 'trafficFromClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'receiveSignalStrength',
      title: intl.$t({ defaultMessage: 'RSSI' }),
      dataIndex: 'receiveSignalStrength',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'rssi',
      title: intl.$t({ defaultMessage: 'SNR' }),
      dataIndex: 'rssi',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'radio.mode',
      title: intl.$t({ defaultMessage: 'Radio Type' }),
      dataIndex: ['radio', 'mode'],
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'cpeMac',
      title: intl.$t({ defaultMessage: 'CPE MAC Address' }),
      dataIndex: 'cpeMac',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'authmethod',
      title: intl.$t({ defaultMessage: 'Auth Method' }),
      dataIndex: 'authmethod',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'status',
      title: intl.$t({ defaultMessage: 'Auth Status' }),
      dataIndex: 'status',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => <>
        { data ? intl.$t({ defaultMessage: 'Authorized' }) :
          intl.$t({ defaultMessage: 'Unauthorized' })
        }
      </>

    },
    {
      key: 'encryptMethod',
      title: intl.$t({ defaultMessage: 'Encryption' }),
      dataIndex: 'encryptMethod',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'packetsToClient',
      title: intl.$t({ defaultMessage: 'Packets To Client' }),
      dataIndex: 'packetsToClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'packetsFromClient',
      title: intl.$t({ defaultMessage: 'Packets From Client' }),
      dataIndex: 'packetsFromClient',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'packetsDropFrom',
      title: intl.$t({ defaultMessage: 'Packets Dropped' }),
      dataIndex: 'packetsDropFrom',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'radio.channel',
      title: intl.$t({ defaultMessage: 'RF Channel' }),
      dataIndex: ['radio', 'channel'],
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'noiseFloor',
      title: intl.$t({ defaultMessage: 'Noise Floor' }),
      dataIndex: 'noiseFloor',
      sorter: true,
      show: !!showAllColumns,
      render: (data) => data || '--'
    },
    {
      key: 'tags',
      title: intl.$t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags'
    }
  ]
  return columns
}


const defaultPayload = {
  searchString: '',
  searchTargetFields: ['clientMac','ipAddress','Username','hostname','ssid','clientVlan','osType'],
  fields: [
    'hostname','osType','healthCheckStatus','clientMac','ipAddress','Username','serialNumber','venueId','switchSerialNumber',
    'ssid','wifiCallingClient','sessStartTime','clientAnalytics','clientVlan','deviceTypeStr','modelName','totalTraffic',
    'trafficToClient','trafficFromClient','receiveSignalStrength','rssi','radio.mode','cpeMac','authmethod','status',
    'encryptMethod','packetsToClient','packetsFromClient','packetsDropFrom','radio.channel','noiseFloor','cog','venueName',
    'apName','clientVlan','networkId','switchName','healthStatusReason','lastUpdateTime']
}

export const ConnectedClientsTable = (props:{ showAllColumns?: boolean }) => {
  const { $t } = useIntl()
  const { showAllColumns } = props
  const ConnectedClientsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useGetClientListQuery,
      defaultPayload
    })
    return (
      <Loader states={[
        tableQuery
      ]}>
        <Subtitle level={4}>
          {$t({ defaultMessage: 'Connected Clients' })}
        </Subtitle>
        <Table
          columns={getCols(useIntl(), showAllColumns)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <ConnectedClientsTable />
  )
}
