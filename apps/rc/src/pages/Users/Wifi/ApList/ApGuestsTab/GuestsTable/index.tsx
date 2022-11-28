/* eslint-disable align-import/align-import */
import { useState } from 'react'

import { Drawer } from 'antd'
import moment from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Alert, cssStr } from '@acx-ui/components'
import {
  Button,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useGetGuestsListQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  Guest,
  GuestTypesEnum,
  transformDisplayText,
  GuestStatusEnum
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'
import { getIntl } from '@acx-ui/utils'

import { GuestsDetail } from '../GuestsDetail'

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

export default function GuestsTable () {
  const { $t } = useIntl()
  const GuestsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useGetGuestsListQuery,
      defaultPayload
    })

    const notificationMessage = $t({
      defaultMessage: 'Guests cannot be added since there are no guest networks'
    })

    const [visible, setVisible] = useState(false)
    const [currentGuest, setCurrentGuest] = useState({} as Guest)

    const columns: TableProps<Guest>['columns'] = [
      {
        key: 'creationDate',
        title: $t({ defaultMessage: 'Created' }),
        dataIndex: 'creationDate',
        sorter: false,
        defaultSortOrder: 'ascend',
        render: (data, row) =>
          <Button
            type='link'
            onClick={() => {
              setCurrentGuest(row)
              setVisible(true)
            }}
          >
            {moment(row.expiryDate).format('DD/MM/YYYY HH:mm')}
          </Button>
      },
      {
        key: 'name',
        title: $t({ defaultMessage: 'Name' }),
        dataIndex: 'name',
        sorter: true,
        defaultSortOrder: 'ascend',
        render: (data, row) =>
          <Button
            type='link'
            onClick={() => {
              setCurrentGuest(row)
              setVisible(true)
            }}
          >
            {data}
          </Button>
      }, {
        key: 'mobilePhoneNumber',
        title: $t({ defaultMessage: 'Phone' }),
        dataIndex: 'mobilePhoneNumber',
        sorter: true
      }, {
        key: 'emailAddress',
        title: $t({ defaultMessage: 'E-mail' }),
        dataIndex: 'emailAddress',
        sorter: true
      }, {
        key: 'guestType',
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'guestType',
        sorter: true,
        render: function (data, row) {
          return renderGuestType(row.guestType)
        }
      }, {
        key: 'ssid',
        title: $t({ defaultMessage: 'Allowed Network' }),
        dataIndex: 'ssid',
        sorter: true,
        render: function (data, row) {
          return renderAllowedNetwork(row)
        }
      }, {
        key: 'expiryDate',
        title: $t({ defaultMessage: 'Expires' }),
        dataIndex: 'expiryDate',
        sorter: true,
        render: function (data, row) {
          return renderExpires(row)
        }
      }, {
        key: 'guestStatus',
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'guestStatus',
        sorter: false,
        render: function (data) {
          return data === GuestStatusEnum.EXPIRED ?
            <span style={{ color: cssStr('--acx-semantics-red-50') }}>{data}</span> : data
        }
      }
    ]

    const onClose = () => {
      setVisible(false)
    }

    return (
      <Loader states={[
        tableQuery
      ]}>
        {
          !tableQuery.data?.data?.length &&
        <Alert message={notificationMessage} type='info' showIcon closable />
        }
        <Table
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='name'
        />

        <Drawer
          title={$t({ defaultMessage: 'Guest Details' })}
          visible={visible}
          onClose={onClose}
          mask={false}
          children={
            <GuestsDetail
              currentGuest={currentGuest}
            />
          }
          width={'550px'}
        />
      </Loader>
    )
  }

  return (
    <GuestsTable />
  )
}

export const renderAllowedNetwork = function (currentGuest: Guest) {
  const { $t } = getIntl()
  // const hasGuestManagerRole = false   //TODO:  from userProfile()
  // if (currentGuest.networkId && !hasGuestManagerRole) {
  //   return (
  //     <TenantLink to={`/networks/${currentGuest.networkId}/network-details/aps`}>
  //       {currentGuest.ssid}</TenantLink>
  //   )
  // } else if (currentGuest.networkId && hasGuestManagerRole) {
  if (currentGuest.networkId) {
    return currentGuest.ssid
  } else {
    return $t({ defaultMessage: 'None' })
  }
}

export const renderExpires = function (row: Guest) {
  const { $t } = getIntl()
  let expiresTime = ''
  if (row.expiryDate && row.expiryDate !== '0') {
    expiresTime = moment(row.expiryDate).format('DD/MM/YYYY HH:mm')
  } else if (!row.expiryDate || row.expiryDate === '0') {
    let result = ''
    if (row.passDurationHours) {
      if (row.passDurationHours > 24) {
        const days = Math.floor(row.passDurationHours / 24)
        const hours = row.passDurationHours % 24
        const dayText = days > 1 ? ' days' : ' day'
        const hourText = hours > 1 ? ' hours' : ' hour'
        result = `${days}${dayText} ${hours}${hourText}`
      } else {
        result = row.passDurationHours + (row.passDurationHours === 1 ? ' hour' : ' hours')
      }
    }
    expiresTime = `${result} ${$t({ defaultMessage: 'since first login' })}`
  }
  return expiresTime
}

export const renderGuestType = (value: string) => {
  const { $t } = getIntl()
  let result = ''
  switch (value) {
    case GuestTypesEnum.MANAGED:
      result = $t({ defaultMessage: 'Managed' })
      break
    case GuestTypesEnum.SELF_SIGN_IN:
      result = $t({ defaultMessage: 'Self Sign In' })
      break
    case GuestTypesEnum.HOST_GUEST:
      result = $t({ defaultMessage: 'Self Sign In' })
      break
    default:
      result = transformDisplayText(value)
      break
  }
  return result
}
