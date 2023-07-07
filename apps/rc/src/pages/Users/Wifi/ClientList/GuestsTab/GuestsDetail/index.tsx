import { useEffect, useState } from 'react'

import { Divider,
  Menu,
  MenuProps,
  Space } from 'antd'
import { useIntl } from 'react-intl'


import {
  Dropdown,
  CaretDownSolidIconReverse,
  Button,
  cssStr,
  Table,
  TableProps,
  Descriptions
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { ClientHealthIcon }          from '@acx-ui/rc/components'
import { useGetGuestsListQuery }     from '@acx-ui/rc/services'
import {
  getOsTypeIcon,
  Guest,
  GuestClient,
  GuestStatusEnum,
  transformDisplayText,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { RolesEnum }             from '@acx-ui/types'
import { hasRoles }              from '@acx-ui/user'

import {
  renderAllowedNetwork,
  renderExpires,
  renderGuestType
} from '../GuestsTable'
import * as UI from '../styledComponents'

import { GenerateNewPasswordModal } from './generateNewPasswordModal'
import { useGuestActions }          from './guestActions'

interface GuestDetailsDrawerProps {
  currentGuest: Guest,
  triggerClose: () => void
}

export const defaultGuestPayload = {
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
  const [generateModalVisible, setGenerateModalVisible] = useState(false)
  const guestAction = useGuestActions()

  const tableQuery = useTableQuery({
    useQuery: useGetGuestsListQuery,
    defaultPayload: defaultGuestPayload
  })

  const hasOnlineClient = function (row: Guest) {
    return row.guestStatus.indexOf(GuestStatusEnum.ONLINE) !== -1
  }

  useEffect(() => {
    const guest = tableQuery.data?.data.filter((item: Guest) => item.id === currentGuest.id)[0]
    if (guest) {
      setGuestDetail(guest)
    }
  }, [currentGuest.id, tableQuery])

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

  const renderMaxNumberOfClients = function (value?: number) {
    return value ? (value === -1) ? $t({ defaultMessage: 'Unlimited' }) : value : '0'
  }

  const columns: TableProps<GuestClient>['columns'] = [
    {
      key: 'osType',
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (data) {
        return <UI.IconContainer>{getOsTypeIcon(data as string)}</UI.IconContainer>
      }
    }, {
      key: 'healthCheckStatus',
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'healthCheckStatus',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: (data, row) => {
        return row.healthCheckStatus ? <ClientHealthIcon type={row.healthCheckStatus} /> : '--'
      }
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
        return formatter(DateFormatEnum.DateTimeFormat)(row.connectSince)
      }
    }
  ]

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

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={hasRoles([RolesEnum.READ_ONLY]) ? [
        {
          label: $t({ defaultMessage: 'Download Information' }),
          key: 'downloadInformation'
        }
      ] : [
        {
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
          && (item.key === 'disableGuest' || item.key === 'enableGuest')) {
          return false
        }

        if (item.key === 'generatePassword') {
          return(guestDetail.guestStatus?.indexOf(GuestStatusEnum.ONLINE) !== -1) ||
            ((guestDetail.guestStatus === GuestStatusEnum.OFFLINE) &&
              guestDetail.networkId && !guestDetail.socialLogin)
        }

        return true
      })}
    />
  )

  return (<>
    <div style={{ textAlign: 'right' }}>
      <Dropdown overlay={menu} key='actions'>{()=>
        <Button type='secondary'>
          <Space>
            {$t({ defaultMessage: 'Actions' })}
            <CaretDownSolidIconReverse />
          </Space>
        </Button>
      }</Dropdown>
    </div>

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Type' })}
        children={renderGuestType(guestDetail.guestType)} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Name' })}
        children={guestDetail.name} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Mobile Phone' })}
        children={transformDisplayText(guestDetail.mobilePhoneNumber)} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Email' })}
        children={transformDisplayText(guestDetail.emailAddress)} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Notes' })}
        children={transformDisplayText(guestDetail.notes)} />
    </Descriptions>

    <Divider />

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Allowed Network' })}
        children={renderAllowedNetwork(guestDetail)} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Guest Created' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(guestDetail.creationDate)} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Access Expires' })}
        children={renderExpires(guestDetail)} />

      <Descriptions.Item
        label={$t({ defaultMessage: 'Max. Number of Clients' })}
        children={renderMaxNumberOfClients(guestDetail.maxNumberOfClients)} />
    </Descriptions>

    <Divider />

    <Descriptions>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={renderStatus(guestDetail)} />
    </Descriptions>

    {guestDetail.clients &&
      <Table
        columns={columns}
        dataSource={guestDetail.clients}
      />}

    <GenerateNewPasswordModal {...{
      generateModalVisible, setGenerateModalVisible, guestDetail, tenantId
    }} />
  </>)
}
