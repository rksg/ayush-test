import { Dropdown, Menu, MenuProps, Space } from 'antd'
import moment                               from 'moment-timezone'
import { useIntl }                          from 'react-intl'

import { Button, PageHeader, RangePicker }                       from '@acx-ui/components'
import { ArrowExpand }                                           from '@acx-ui/icons'
import { useDisconnectClientMutation, useGetClientDetailsQuery } from '@acx-ui/rc/services'
import { ClientStatusEnum, ClientUrlsInfo }                      from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useSearchParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess }                                                      from '@acx-ui/user'
import { DateFilter, DateRange, enableNewApi, encodeParameter, useDateFilter } from '@acx-ui/utils'

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
  const { data: clentDetails } = useGetClientDetailsQuery(
    { params: { tenantId, clientId } },
    { skip: searchParams.get('clientStatus') === ClientStatusEnum.HISTORICAL }
  )
  const [disconnectClient] = useDisconnectClientMutation()
  const navigate = useNavigate()
  const basePath = useTenantLink('/users/wifi/clients')

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch (e.key) {
      // case 'edit-user': TODO: post-ga
      //   break
      // case 'download-information':
      //   break
      case 'disconnect-client':
        const clientData = enableNewApi(ClientUrlsInfo.disconnectClient)
          ? [{
            clientMac: clientId,
            serialNumber: clentDetails?.apSerialNumber
          }]
          : [{
            clientMac: clientId,
            apMac: clentDetails?.apMac
          }]
        disconnectClient({ params: { tenantId }, payload: clientData }).then(()=>{
          const period = encodeParameter<DateFilter>({
            startDate: moment().subtract(24, 'hours').format(),
            endDate: moment().format(),
            range: DateRange.custom
          })
          navigate({
            ...basePath,
            // eslint-disable-next-line max-len
            pathname: `${basePath.pathname}/${clientId}/details/overview?clientStatus=historical&period=${period}`
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
          disabled: enableNewApi(ClientUrlsInfo.disconnectClient) ?
            !clentDetails?.apSerialNumber : !clentDetails?.apMac,
          key: 'disconnect-client'
        }]}
    />
  )

  return (
    <PageHeader
      title={<Space size={4}>{clientId}
        {
          searchParams.get('hostname') &&
          searchParams.get('hostname') !== clientId &&
          <Space style={{ fontSize: '14px', marginLeft: '8px' }} size={0}>
            ({searchParams.get('hostname')})
          </Space>
        }
      </Space>}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Clients' }), link: '' },
        { text: $t({ defaultMessage: 'Wireless' }), link: '' },
        { text: $t({ defaultMessage: 'Clients List' }), link: '/users/wifi/clients' }
      ]}
      extra={filterByAccess([
        <DatePicker key='date-filter' />,
        <Dropdown overlay={menu}>
          <Button type='secondary'>
            <Space>
              {$t({ defaultMessage: 'Actions' })}
              <ArrowExpand />
            </Space>
          </Button>
        </Dropdown>
      ])}
      footer={<ClientDetailTabs />}
    />
  )
}

export default ClientDetailPageHeader
