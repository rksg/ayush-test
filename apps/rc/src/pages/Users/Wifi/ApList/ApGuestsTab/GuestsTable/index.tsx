import { ReactNode, useState } from 'react'

import { useIntl } from 'react-intl'

import { Alert, Subtitle, Tooltip }                                              from '@acx-ui/components'
import { Button, PageHeader, Table, TableProps, Loader, showActionModal } from '@acx-ui/components'
import { useGetGuestsListQuery }                                          from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  useTableQuery,
  Network,
  NetworkType,
  Guest,
  GuestTypesEnum
}                                                            from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { getIntl }                                           from '@acx-ui/utils'
import moment        from 'moment-timezone'
import { Divider, Drawer, Form } from 'antd'

const disabledType = [NetworkTypeEnum.DPSK, NetworkTypeEnum.CAPTIVEPORTAL]

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
    'cog',
  ]
}

export default function GuestsTable () {
  const { $t } = useIntl()
  const GuestsTable = () => {
    const navigate = useNavigate()
    const linkToEditNetwork = useTenantLink('/networks/')
    const tableQuery = useTableQuery({
      useQuery: useGetGuestsListQuery,
      defaultPayload
    })
    const { tenantId } = useParams()

    const notificationMessage = $t({
      defaultMessage: 'Guests cannot be added since there are no guest networks'
    })

    const [visible, setVisible] = useState(false)

    // this.subscriptions.push(this.userProfileService.getUserProfile(false).subscribe(user => {
    //   if (this.userProfileService.userHasRole(user, 'OFFICE_ADMIN')) {
    //     this.hasGuestManagerRole = true;
    //   }
    // }));

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
          setVisible(true)
        }}
      >
        {data}
      </Button>
      },
      {
        key: 'name',
        title: $t({ defaultMessage: 'Name' }),
        dataIndex: 'name',
        sorter: true,
        defaultSortOrder: 'ascend',
        // render: function (data, row) {
        //   if(disabledType.indexOf(row.nwSubType as NetworkTypeEnum) > -1){
        //     return data
        //   }else{
        //     return (
        //       <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
        //     )
        //   }
        // }
      },
      {
        key: 'mobilePhoneNumber',
        title: $t({ defaultMessage: 'Phone' }),
        dataIndex: 'mobilePhoneNumber',
        sorter: true
      },
      {
        key: 'emailAddress',
        title: $t({ defaultMessage: 'E-mail' }),
        dataIndex: 'emailAddress',
        sorter: true,
      },
      {
        key: 'guestType',
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'guestType',
        sorter: true,
        render: function (data) {
          switch (data) {
            case GuestTypesEnum.MANAGED:
              return 'Managed'
            case GuestTypesEnum.SELF_SIGN_IN:
              return 'Self Sign In';
            case GuestTypesEnum.HOST_GUEST:
              return 'Self Sign In'
            default:
              return data
          }
        }
      },
      {
        key: 'ssid',
        title: $t({ defaultMessage: 'Allowed Network' }),
        dataIndex: 'ssid',
        sorter: true,
        render: function (data, row) {
          const hasGuestManagerRole = false // from userProfile()
          if (row.networkId && !hasGuestManagerRole) {
            return (
              <TenantLink to={`/networks/${row.networkId}/network-details/aps`}>{data}</TenantLink>
            )
          } else if (row.networkId && hasGuestManagerRole) {
            return data
          } else {
            return 'None'
          }
        }
      },
      {
        key: 'expiryDate',
        title: $t({ defaultMessage: 'Expires' }),
        dataIndex: 'expiryDate',
        sorter: true,
        render: function (data, row) {
          if (data && data !== '0') {
            return moment(row.expiryDate).format('DD/MM/YYYY HH:mm')
          } else if (!data || data === '0') {
            let result = ''
            if (row.passDurationHours) {
              if (row.passDurationHours > 24) {
                const days = Math.floor(row.passDurationHours / 24)
                const hours = row.passDurationHours % 24;
                const dayText = days > 1 ? ' days' : ' day';
                const hourText = hours > 1 ? ' hours' : ' hour';
                result = `${days}${dayText} ${hours}${hourText}`;
              } else {
                result = row.passDurationHours + (row.passDurationHours === 1 ? ' hour' : ' hours');
              }
            }
            return `${result} since first login`
          }
          return ''
        }
      },
      {
        key: 'guestStatus',
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'guestStatus',
        sorter: false
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
          rowKey='id'
        />

        <Drawer
          title={$t({ defaultMessage: 'AP Details' })}
          visible={visible}
          onClose={onClose}
          mask={false}
          children={<>  
           <Divider />
            <Form.Item
              label={$t({ defaultMessage: 'Uptime' })}
            /></>}
          width={'400px'}
        />
       
      </Loader>
    )
  }

  return (
    <GuestsTable />
  )
}
