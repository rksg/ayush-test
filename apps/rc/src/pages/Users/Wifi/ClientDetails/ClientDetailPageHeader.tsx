import { Menu, MenuProps, Space } from 'antd'
import moment                     from 'moment-timezone'
import { useIntl }                from 'react-intl'

import {
  Dropdown,
  CaretDownSolidIcon,
  Button,
  PageHeader,
  RangePicker,
  getDefaultEarliestStart
} from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { isEqualCaptivePortal }    from '@acx-ui/rc/components'
import {
  useDisconnectClientMutation,
  useRevokeClientMutation,
  useGetClientsQuery,
  useGetHistoryClientDetailQuery
} from '@acx-ui/rc/services'
import { ClientStatusEnum, ClientUrlsInfo } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { WifiScopes } from '@acx-ui/types'
import {
  getUserProfile,
  hasAllowedOperations,
  hasPermission
} from '@acx-ui/user'
import {
  DateFilter,
  DateRange,
  encodeParameter,
  getOpsApi,
  useDateFilter
} from '@acx-ui/utils'


import ClientDetailTabs from './ClientDetailTabs'
function DatePicker () {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { startDate, endDate, setDateFilter, range } = useDateFilter({
    showResetMsg,
    earliestStart: getDefaultEarliestStart() })

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
    maxMonthRange={isDateRangeLimit ? 1 : 3}
  />
}

function ClientDetailPageHeader () {
  const { $t } = useIntl()
  const { clientId } = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()

  // Connection Client
  const clientInfo = useGetClientsQuery({ payload: {
    filters: {
      macAddress: [clientId]
    }
  } })?.data?.data[0]
  const status = clientInfo ? ClientStatusEnum.CONNECTED : ClientStatusEnum.HISTORICAL
  const isHistoricalClient = (status === ClientStatusEnum.HISTORICAL)

  // historical client
  const histClientInfo = useGetHistoryClientDetailQuery({
    params: { clientId }
  }, { skip: !isHistoricalClient })?.data?.data


  const hostname = (!isHistoricalClient)? clientInfo?.hostname : histClientInfo?.hostname
  // The below var only using for menu action (connect client)
  const { macAddress, venueInformation, apInformation, networkInformation } = clientInfo || {}
  const venueId = venueInformation?.id
  const apSerialNumber = apInformation?.serialNumber
  const networkType = networkInformation?.type

  const [disconnectClient] = useDisconnectClientMutation()
  const [revokeClient] = useRevokeClientMutation()
  const navigate = useNavigate()
  const basePath = useTenantLink('/users/wifi/clients')

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      // case 'edit-user': TODO: post-ga
      //   break
      // case 'download-information':
      //   break
      case 'disconnect-client':
        disconnectClient({
          params: {
            venueId: venueId,
            serialNumber: apSerialNumber,
            clientMacAddress: macAddress
          }
        }).then(()=>{
          const period = encodeParameter<DateFilter>({
            startDate: moment().subtract(8, 'hours').format(),
            endDate: moment().format(),
            range: DateRange.custom
          })
          navigate({
            ...basePath,
            // eslint-disable-next-line max-len
            pathname: `${basePath.pathname}/${clientId}/details/overview`,
            search: `clientStatus=historical&period=${period}`
          })
        })
        break

      case 'revoke-client':
        revokeClient({
          params: {
            venueId: venueId,
            serialNumber: apSerialNumber,
            clientMacAddress: macAddress
          }
        }).then(()=> {
          navigate({
            ...basePath,
            // eslint-disable-next-line max-len
            pathname: `${basePath.pathname}/${clientId}/details/overview`,
            search: 'clientStatus=connected'
          })
        })
        break
      default:
        break
    }
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
      // { TODO: post-ga
      //   label: $t({ defaultMessage: 'Edit User' }),
      //   key: 'edit-user'
      // },
      // {
      //   label: $t({ defaultMessage: 'Download Information' }),
      //   key: 'download-information'
      // },
        {
          label: $t({ defaultMessage: 'Disconnect Client' }),
          key: 'disconnect-client'
        },
        // eslint-disable-next-line max-len
        ...(((status === ClientStatusEnum.CONNECTED) &&
            isEqualCaptivePortal(networkType)) ?
          [{
            label: $t({ defaultMessage: 'Revoke Network Access' }),
            key: 'revoke-client'
          }] : [])
      ]}
    />
  )

  const showMenu = rbacOpsApiEnabled
    ? hasAllowedOperations([ getOpsApi(ClientUrlsInfo.disconnectClient) ])
    : hasPermission({ scopes: [WifiScopes.UPDATE] })

  return (
    <PageHeader
      title={<Space size={4}>{clientId}
        {hostname && (hostname !== clientId) &&
          <Space style={{ fontSize: '14px', marginLeft: '8px' }} size={0}>
            ({hostname})
          </Space>
        }
      </Space>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Clients' }), link: '' },
        { text: $t({ defaultMessage: 'Wireless' }), link: '' },
        { text: $t({ defaultMessage: 'Clients List' }), link: '/users/wifi/clients' }
      ]}
      extra={[
        <DatePicker />,
        (!isHistoricalClient && showMenu) &&
          <Dropdown overlay={menu}>{()=>
            <Button type='primary'>
              <Space>
                {$t({ defaultMessage: 'Actions' })}
                <CaretDownSolidIcon />
              </Space>
            </Button>
          }</Dropdown>
      ]}
      footer={<ClientDetailTabs />}
    />
  )
}

export default ClientDetailPageHeader
