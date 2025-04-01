import { useEffect, useState } from 'react'

import { Divider,
  Menu,
  MenuProps,
  Space } from 'antd'
import { useIntl } from 'react-intl'

import {
  Dropdown,
  CaretDownSolidIcon,
  Button,
  cssStr,
  Table,
  TableProps,
  Descriptions
} from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { ClientHealthIcon }          from '@acx-ui/rc/components'
import {
  ClientInfo,
  ClientUrlsInfo,
  getClientHealthClass,
  getOsTypeIcon,
  Guest,
  GuestStatusEnum,
  GuestTypesEnum,
  transformDisplayText
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }                             from '@acx-ui/react-router-dom'
import { RolesEnum, RequestPayload, WifiScopes }             from '@acx-ui/types'
import { hasCrossVenuesPermission, hasRoles, hasPermission } from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                          from '@acx-ui/utils'

import {
  renderAllowedNetwork,
  renderExpires,
  renderGuestType,
  operationRoles
} from '../GuestsTable'
import * as UI from '../styledComponents'

import { GenerateNewPasswordModal } from './generateNewPasswordModal'
import { useGuestActions }          from './guestActions'

interface GuestDetailsDrawerProps {
  currentGuest: Guest,
  triggerClose: () => void,
  queryPayload?: RequestPayload
}

export const isEnabledGeneratePassword = (guestDetail:Guest) => {
  // self-sign in & host approval should to use forget password
  const isValidType = guestDetail.guestType !== GuestTypesEnum.SELF_SIGN_IN &&
  guestDetail.guestType !== GuestTypesEnum.HOST_GUEST &&
  guestDetail.guestType !== GuestTypesEnum.DIRECTORY &&
  guestDetail.guestType !== GuestTypesEnum.SAML
  const isOnline = guestDetail.guestStatus?.indexOf(GuestStatusEnum.ONLINE) !== -1
  const isOffline = guestDetail.guestStatus === GuestStatusEnum.OFFLINE &&
  guestDetail.wifiNetworkId
  const isUnlimit = guestDetail.maxNumberOfClients === -1 &&
  guestDetail.guestStatus !== GuestStatusEnum.EXPIRED &&
  (!guestDetail.emailAddress || !guestDetail.mobilePhoneNumber)
  return Boolean(isValidType && (isOnline || isOffline || isUnlimit))
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
    'wifiNetworkId',
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
    'cog',
    'hostApprovalEmail'
  ]
}


export const GuestsDetail= (props: GuestDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { currentGuest } = props
  const { tenantId } = useParams()
  const [guestDetail, setGuestDetail] = useState({} as Guest)
  const [generateModalVisible, setGenerateModalVisible] = useState(false)
  const guestAction = useGuestActions()
  const isReadOnly = !hasCrossVenuesPermission() || hasRoles([RolesEnum.READ_ONLY])

  const hasOnlineClient = function (row: Guest) {
    return row.guestStatus.indexOf(GuestStatusEnum.ONLINE) !== -1
  }

  useEffect(() => {
    setGuestDetail(currentGuest)
  }, [currentGuest])

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

  const columns: TableProps<ClientInfo>['columns'] = [
    {
      key: 'osType',
      title: $t({ defaultMessage: 'OS' }),
      dataIndex: 'osType',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (_, { osType }) {
        return <UI.IconContainer>{getOsTypeIcon(osType as string)}</UI.IconContainer>
      }
    }, {
      key: 'signalStatus.health',
      title: $t({ defaultMessage: 'Health' }),
      dataIndex: 'signalStatus.health',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: (_, row) => {
        const health = row.signalStatus?.health
        const healthClass = getClientHealthClass(health)
        return health ? <ClientHealthIcon type={healthClass} /> : '--'
      }
    }, {
      key: 'macAddress',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'macAddress',
      sorter: false,
      defaultSortOrder: 'ascend'
    }, {
      key: 'venueInformation.id',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueInformation.name',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (_, { venueInformation }) {
        return <TenantLink to={`/venues/${venueInformation.id}/venue-details/overview`}>
          {venueInformation.name}
        </TenantLink>
      }
    }, {
      key: 'apInformation.serialNumber',
      title: $t({ defaultMessage: 'AP' }),
      dataIndex: 'apInformation.name',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (_, { apInformation }) {
        return <TenantLink to={`/devices/wifi/${apInformation.serialNumber}/details/overview`}>
          {apInformation.name}
        </TenantLink>
      }
    }, {
      key: 'switchInformation.serialNumber',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchInformation.name',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (_, { switchInformation }) {
        const { name, id, serialNumber } = switchInformation || {}
        if (!name) {
          return noDataDisplay
        } else {
          return (
            <TenantLink to={`/devices/switch/${id}/${serialNumber}/details/overview`}>
              {name}
            </TenantLink>
          )
        }
      }
    }, {
      key: 'connectedTime',
      title: $t({ defaultMessage: 'Time Connected' }),
      dataIndex: 'connectedTime',
      sorter: false,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return row.connectedTimeString
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
      items={isReadOnly ? [
        {
          label: $t({ defaultMessage: 'Download Information' }),
          key: 'downloadInformation'
        }
      ] : [{
        label: $t({ defaultMessage: 'Generate New Password' }),
        key: 'generatePassword',
        scopeKey: [WifiScopes.UPDATE],
        rbacOpsIds: [getOpsApi(ClientUrlsInfo.generateGuestPassword)],
        roles: operationRoles
      }, {
        label: $t({ defaultMessage: 'Download Information' }),
        key: 'downloadInformation',
        scopeKey: [WifiScopes.READ],
        roles: operationRoles
      },
      {
        label: $t({ defaultMessage: 'Disable Guest' }),
        key: 'disableGuest',
        scopeKey: [WifiScopes.UPDATE],
        rbacOpsIds: [getOpsApi(ClientUrlsInfo.disableGuests)],
        roles: operationRoles
      }, {
        label: $t({ defaultMessage: 'Enable Guest' }),
        key: 'enableGuest',
        scopeKey: [WifiScopes.UPDATE],
        rbacOpsIds: [getOpsApi(ClientUrlsInfo.enableGuests)],
        roles: operationRoles
      }, {
        label: $t({ defaultMessage: 'Delete Guest' }),
        key: 'deleteGuest',
        scopeKey: [WifiScopes.DELETE],
        rbacOpsIds: [getOpsApi(ClientUrlsInfo.deleteGuest)],
        roles: operationRoles
      }].filter((item) => {
        const { scopeKey: scopes, rbacOpsIds, roles } = item
        if (!hasPermission({ scopes, rbacOpsIds, roles })) {
          return false
        }
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
          return isEnabledGeneratePassword(guestDetail)
        }

        return true
      })}
    />
  )

  return (<>
    <div style={{ textAlign: 'right' }}>
      <Dropdown overlay={menu} key='actions'>{()=>
        <Button type='primary'>
          <Space>
            {$t({ defaultMessage: 'Actions' })}
            <CaretDownSolidIcon />
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
        children={<Space data-testid='guest-status'>{renderStatus(guestDetail)}</Space>} />
    </Descriptions>

    {guestDetail.clients &&
      <Table
        rowKey='macAddress'
        columns={columns}
        dataSource={guestDetail.clients}
      />}

    <GenerateNewPasswordModal {...{
      generateModalVisible, setGenerateModalVisible, guestDetail, tenantId
    }} />
  </>)
}
