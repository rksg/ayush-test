import { Divider, Form } from 'antd'
import moment            from 'moment-timezone'
import { useIntl }       from 'react-intl'

import { cssStr, Table, TableProps } from '@acx-ui/components'
import {
  Guest,
  GuestClient,
  GuestStatusEnum,
  transformDisplayText
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import {
  renderAllowedNetwork,
  renderExpires,
  renderGuestType
} from '../GuestsTable'
import { DrawerFormItem } from '../styledComponents'


interface GuestDetailsDrawerProps {
  currentGuest: Guest,
}

export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentGuest } = props

  const hasOnlineClient = currentGuest.guestStatus.indexOf(GuestStatusEnum.ONLINE)!== -1

  const renderStatus = function (row: Guest) {
    if (row.maxNumberOfClients !== -1 ||
      row.guestStatus.indexOf(GuestStatusEnum.NOT_APPLICABLE) === -1) {
      if (row.guestStatus === GuestStatusEnum.EXPIRED) {
        return <span style={{ color: cssStr('--acx-semantics-red-50') }}>{row.guestStatus}</span>
      } else if (hasOnlineClient) {
        return <span style={{ color: cssStr('--acx-semantics-green-50') }}>{row.guestStatus}</span>
      }
    }
    return row.guestStatus
  }

  const columns: TableProps<GuestClient>['columns'] = [
    {
      key: 'osType',
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      sorter: false,
      defaultSortOrder: 'ascend'
      // render: function (data, row) {} //TODO: Wait for connected clients
    }, {
      key: 'healthCheckStatus',
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'healthCheckStatus',
      sorter: false,
      defaultSortOrder: 'ascend'
      // render: function (data, row) {} //TODO: Wait for connected clients
    }, {
      key: 'clientMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'clientMac',
      sorter: false,
      defaultSortOrder: 'ascend'
    }, {
      key: 'venueId',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueId',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      }
    }, {
      key: 'serialNumber',
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: 'serialNumber',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>
          {row.apName}
        </TenantLink>
      }
    }, {
      key: 'switchSerialNumber',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchSerialNumber',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return transformDisplayText(row.switchSerialNumber)
      }
    }, {
      key: 'connectSince',
      title: $t({ defaultMessage: 'Time Connected' }),
      dataIndex: 'connectSince',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (data, row) {
        return moment(row.connectSince).format('DD/MM/YYYY HH:mm')
      }
    }
  ]

  return (<Form
    labelCol={{ span: 10 }}
    labelAlign='left' >

    <DrawerFormItem
      label={$t({ defaultMessage: 'Guest Type:' })}
      children={renderGuestType(currentGuest.guestType)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Guest Name:' })}
      children={currentGuest.name} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Mobile Phone:' })}
      children={transformDisplayText(currentGuest.mobilePhoneNumber)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Email:' })}
      children={transformDisplayText(currentGuest.emailAddress)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Notes:' })}
      children={transformDisplayText(currentGuest.notes)} />

    <Divider />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Allowed Network:' })}
      children={renderAllowedNetwork(currentGuest)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Guest Created:' })}
      children={moment(currentGuest.creationDate).format('DD/MM/YYYY HH:mm')} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Access Expires:' })}
      children={renderExpires(currentGuest)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Max. Number of Clients:' })}
      children={currentGuest.maxNumberOfClients || '0'} />

    <Divider />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Status:' })}
      children={renderStatus(currentGuest)} />

    {currentGuest.clients &&
      <Table
        columns={columns}
        dataSource={currentGuest.clients}
        pagination={false}
        rowKey='clientMac'
      />}
  </Form>
  )
}




