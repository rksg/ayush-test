import { Dropdown, Menu, MenuProps, Space } from 'antd'
import moment                               from 'moment'
import { useIntl }                          from 'react-intl'

import { Button, DisabledButton, PageHeader, RangePicker }       from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { ArrowExpand, ClockOutlined }                            from '@acx-ui/icons'
import { useDisconnectClientMutation, useGetClientDetailsQuery } from '@acx-ui/rc/services'
import {
  useNavigate,
  useParams,
  useSearchParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { hasAccesses }                                           from '@acx-ui/user'
import { DateFilter, DateRange, encodeParameter, useDateFilter } from '@acx-ui/utils'

import ClientDetailTabs from './ClientDetailTabs'

function DatePicker () {
  const { $t } = useIntl()
  const enableAnalytics = useIsSplitOn(Features.CLIENT_TROUBLESHOOTING)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return enableAnalytics
    ? <RangePicker
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={setDateFilter as CallableFunction}
      showTimePicker
      selectionType={range}
    />
    : <DisabledButton icon={<ClockOutlined />}>
      {$t({ defaultMessage: 'Last 24 Hours' })}
    </DisabledButton>
}


function ClientDetailPageHeader () {
  const { $t } = useIntl()
  const { tenantId, clientId } = useParams()
  const [searchParams] = useSearchParams()
  const { data: clentDetails } = useGetClientDetailsQuery({ params: { tenantId, clientId } })
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
        const clientData = [{
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
          disabled: !clentDetails?.apMac,
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
        { text: $t({ defaultMessage: 'Wi-Fi Users' }), link: '/users/wifi/clients' }
      ]}
      extra={hasAccesses([
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
