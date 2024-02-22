import { Menu, MenuProps, Space } from 'antd'
import moment                     from 'moment-timezone'
import { useIntl }                from 'react-intl'

import { Dropdown, CaretDownSolidIcon, Button, PageHeader, RangePicker }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { isEqualCaptivePortal }                                                                   from '@acx-ui/rc/components'
import { useDisconnectClientMutation, useGetClientOrHistoryDetailQuery, useRevokeClientMutation } from '@acx-ui/rc/services'
import { Client, ClientStatusEnum }                                                               from '@acx-ui/rc/utils'
import { useNavigate, useParams, useSearchParams, useTenantLink }                                 from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                         from '@acx-ui/user'
import { DateFilter, DateRange, encodeParameter, useDateFilter }                                  from '@acx-ui/utils'


import ClientDetailTabs from './ClientDetailTabs'
function DatePicker () {
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return <RangePicker
    selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
    onDateApply={setDateFilter as CallableFunction}
    showTimePicker
    selectionType={range}
  />
}

function ClientDetailPageHeader () {
  const { $t } = useIntl()
  const { tenantId, clientId } = useParams()
  const [searchParams] = useSearchParams()
  const { data: result } = useGetClientOrHistoryDetailQuery(
    { params: {
      tenantId,
      clientId,
      status: searchParams.get('clientStatus') || ClientStatusEnum.CONNECTED
    } })
  const clentDetails = (result?.isHistorical ?
    { hostname: result?.data?.hostname } : result?.data) as Client
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
        const clientData = [{
          clientMac: clientId,
          serialNumber: clentDetails?.apSerialNumber
        }]
        disconnectClient({ params: { tenantId }, payload: clientData }).then(()=>{
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
          params: { tenantId },
          payload: [{
            clientMac: clientId,
            serialNumber: clentDetails?.apSerialNumber
          }]
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
          disabled: !clentDetails?.apSerialNumber,
          key: 'disconnect-client'
        },
        // eslint-disable-next-line max-len
        ...((wifiEDAClientRevokeToggle && !result?.isHistorical && isEqualCaptivePortal(result?.data.networkType)) ? [{
          label: $t({ defaultMessage: 'Revoke Network Access' }),
          key: 'revoke-client'
        }] : [])
      ]}
    />
  )

  return (
    <PageHeader
      title={<Space size={4}>{clientId}
        {
          clentDetails?.hostname &&
          clentDetails?.hostname !== clientId &&
          <Space style={{ fontSize: '14px', marginLeft: '8px' }} size={0}>
            ({clentDetails?.hostname})
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
        ...filterByAccess([
          <Dropdown overlay={menu}>{()=>
            <Button type='primary'>
              <Space>
                {$t({ defaultMessage: 'Actions' })}
                <CaretDownSolidIcon />
              </Space>
            </Button>
          }</Dropdown>
        ])
      ]}
      footer={<ClientDetailTabs />}
    />
  )
}

export default ClientDetailPageHeader
