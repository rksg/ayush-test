import { useEffect, useState } from 'react'

import { Divider, Dropdown, Form, Menu, MenuProps, Space } from 'antd'
import moment                                              from 'moment-timezone'
import { useIntl }                                         from 'react-intl'

import { Button, cssStr, Table, TableProps } from '@acx-ui/components'
import { ArrowExpand }                       from '@acx-ui/icons'
import { useGetGuestsListQuery }             from '@acx-ui/rc/services'
import {
  Guest,
  GuestClient,
  GuestStatusEnum,
  transformDisplayText,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import {
  renderAllowedNetwork,
  renderExpires,
  renderGuestType
} from '../GuestsTable'
import { DrawerFormItem } from '../styledComponents'

import { useGuestActions } from './guestActions'
import { GenerateNewPasswordModal } from './generateNewPasswordModal'


interface GuestDetailsDrawerProps {
  currentGuest: Guest,
  triggerClose: () => void
}

const defaultPayload = {
  searchString: '',
  searchTargetFields: [
    'name',
    'mobilePhoneNumber',
    'emailAddress'],
  fields: [
    'creationDate',
    'name',
    'passDurationHours',
    'id',
    'networkId',
    'maxNumberOfClients',
    'notes',
    'clients',
    'guestStatus',
    'emailAddress',
    'mobilePhoneNumber',
    'guestType',
    'ssid',
    'socialLogin',
    'expiryDate',
    'cog'
  ]
}


export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentGuest } = props
  const { tenantId } = useParams()
  const [guestDetail, setGuestDetail] = useState({} as Guest)
  const tableQuery = useTableQuery({
    useQuery: useGetGuestsListQuery,
    defaultPayload
  })

  const hasOnlineClient = function (row: Guest) {
    return row.guestStatus.indexOf(GuestStatusEnum.ONLINE) !== -1
  }

  useEffect(() => {
    const guest = tableQuery.data?.data.filter((item: Guest) => item.id === currentGuest.id)[0]
    if (guest) {
      setGuestDetail(guest)
    }

  }, [tableQuery])


  const renderStatus = function (row: Guest) {
    if(Object.keys(row).length === 0) {
      return
    }

    if (row.maxNumberOfClients !== -1 ||
      row.guestStatus.indexOf(GuestStatusEnum.NOT_APPLICABLE) === -1) {
      if (row.guestStatus === GuestStatusEnum.EXPIRED) {
        return <span style={{ color: cssStr('--acx-semantics-red-50') }}>{row.guestStatus}</span>
      } else if (hasOnlineClient(row)) {
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
        return <TenantLink to={`/devices/aps/${row.serialNumber}/details/overview`}>
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

  const guestAction = useGuestActions()
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      case 'deleteGuest':
        guestAction.showDeleteGuest(guestDetail, tenantId, props.triggerClose)
        break
      case 'enableGuest':
        guestAction.enableGuest(guestDetail, tenantId)
        break
      case 'disableGuest':
        guestAction.disableGuest(guestDetail, tenantId)
        break
      case 'downloadInformation':
        guestAction.showDownloadInformation(guestDetail, tenantId)
        break
      case 'generatePassword':
        setGenerateModalVisible(true)
        break
      default:
        break
    }
  }

  const [generateModalVisible, setGenerateModalVisible] = useState(false)


  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[{
        label: $t({ defaultMessage: 'Generate New Password' }),
        key: 'generatePassword'
      }, {
        label: $t({ defaultMessage: 'Download Information' }),
        key: 'downloadInformation'
      }, {
        label: $t({ defaultMessage: 'Disable Guest' }),
        key: 'disableGuest'
      }, {
        label: $t({ defaultMessage: 'Enable Guest' }),
        key: 'enableGuest'
      }, {
        label: $t({ defaultMessage: 'Delete Guest' }),
        key: 'deleteGuest'
      }].filter((item) => {
        if (item.key === 'enableGuest' &&
        guestDetail.guestStatus !== GuestStatusEnum.DISABLED) {
          return false
        } else if (item.key === 'disableGuest' &&
        guestDetail.guestStatus === GuestStatusEnum.DISABLED) {
          return false
        } else if (guestDetail.guestStatus === GuestStatusEnum.EXPIRED
          && (item.key === 'disableGuest' || item.key === 'enableGuest'
            || item.key === 'generatePassword')) {
          return false
        }
        return true
      })}
    />
  )


  return (<Form
    labelCol={{ span: 10 }}
    labelAlign='left' >
    <div style={{
      textAlign: 'right'
    }}>
      <Dropdown overlay={menu} key='actions'>
        <Button type='secondary'>
          <Space>
            {$t({ defaultMessage: 'Actions' })}
            <ArrowExpand />
          </Space>
        </Button>
      </Dropdown>
    </div>

    <DrawerFormItem
      label={$t({ defaultMessage: 'Guest Type:' })}
      children={renderGuestType(guestDetail.guestType)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Guest Name:' })}
      children={guestDetail.name} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Mobile Phone:' })}
      children={transformDisplayText(guestDetail.mobilePhoneNumber)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Email:' })}
      children={transformDisplayText(guestDetail.emailAddress)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Notes:' })}
      children={transformDisplayText(guestDetail.notes)} />

    <Divider />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Allowed Network:' })}
      children={renderAllowedNetwork(guestDetail)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Guest Created:' })}
      children={moment(guestDetail.expiryDate).format('DD/MM/YYYY HH:mm')} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Access Expires:' })}
      children={renderExpires(guestDetail)} />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Max. Number of Clients:' })}
      children={guestDetail.maxNumberOfClients || '0'} />

    <Divider />

    <DrawerFormItem
      label={$t({ defaultMessage: 'Status:' })}
      children={renderStatus(guestDetail)} />

    {guestDetail.clients &&
      <Table
        columns={columns}
        dataSource={guestDetail.clients}
        pagination={false}
      />}

    <GenerateNewPasswordModal {...{ generateModalVisible, setGenerateModalVisible, guestDetail }}
    />
  </Form>
  )
}




