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
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { isEqualCaptivePortal }   from '@acx-ui/rc/components'
import {
  useDisconnectClientMutation,
  useGetClientOrHistoryDetailQuery,
  useRevokeClientMutation,
  useGetClientsQuery
} from '@acx-ui/rc/services'
import { Client, ClientStatusEnum, ClientUrlsInfo } from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useSearchParams,
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
}  from '@acx-ui/utils'


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
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const { $t } = useIntl()
  const { tenantId, clientId } = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED
  const isHisToricalClient = (status === ClientStatusEnum.HISTORICAL)

  const clientInfo = useGetClientsQuery({ payload: {
    filters: {
      macAddress: [clientId]
    }
  } }, { skip: !isWifiRbacEnabled || isHisToricalClient })?.data?.data[0]

  // non-rbac API or History Client
  const { data: result } = useGetClientOrHistoryDetailQuery(
    { params: {
      tenantId,
      clientId,
      status
    } }, { skip: isWifiRbacEnabled && !isHisToricalClient })

  const clentDetails = (isHisToricalClient
    ? { hostname: result?.data?.hostname }
    : result?.data) as Client

  /* eslint-disable max-len */
  const hostname = isWifiRbacEnabled ? clientInfo?.hostname : clentDetails?.hostname
  const macAddress = isWifiRbacEnabled ? clientInfo?.macAddress : clentDetails?.clientMac
  const venueId = isWifiRbacEnabled ? clientInfo?.venueInformation.id : clentDetails?.venueId
  const apSerialNumber = isWifiRbacEnabled ? clientInfo?.apInformation.serialNumber : clentDetails?.apSerialNumber
  const networkType = isWifiRbacEnabled ? clientInfo?.networkInformation.type : clentDetails?.networkType
  /* eslint-enable max-len */

  const [disconnectClient] = useDisconnectClientMutation()
  const [revokeClient] = useRevokeClientMutation()
  const navigate = useNavigate()
  const basePath = useTenantLink('/users/wifi/clients')
  const wifiEDAClientRevokeToggle = useIsSplitOn(Features.WIFI_EDA_CLIENT_REVOKE_TOGGLE)

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
        ...((wifiEDAClientRevokeToggle &&
            (status === ClientStatusEnum.CONNECTED) &&
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
        {
          hostname && (hostname !== clientId) &&
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
        (!isHisToricalClient && showMenu) &&
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
