import { Dropdown, Menu, Space } from 'antd'
import moment                    from 'moment'
import { useIntl }               from 'react-intl'

import { Button, DisabledButton, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { ArrowExpand, ClockOutlined }                      from '@acx-ui/icons'
import {
  useParams,
  useSearchParams
} from '@acx-ui/react-router-dom'
import { dateRangeForLast, useDateFilter } from '@acx-ui/utils'

import ClientDetailTabs from './ClientDetailTabs'

function DatePicker () {
  const { $t } = useIntl()
  const enableAnalytics = useIsSplitOn(Features.CLIENT_TROUBLESHOOTING)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return enableAnalytics
    ? <RangePicker
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      enableDates={dateRangeForLast(3,'months')}
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
  const { clientId } = useParams()
  const [searchParams] = useSearchParams()

  const menu = (
    <Menu
      items={[{
        label: $t({ defaultMessage: 'Edit User' }),
        key: 'edit-user'
      }, {
        label: $t({ defaultMessage: 'Download Information' }),
        key: 'download-information'
      }, {
        label: $t({ defaultMessage: 'Disconnect Client' }),
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
      extra={[
        <DatePicker key='date-filter' />,
        <Dropdown overlay={menu} key='actions'>
          <Button type='secondary'>
            <Space>
              {$t({ defaultMessage: 'Actions' })}
              <ArrowExpand />
            </Space>
          </Button>
        </Dropdown>
      ]}
      footer={<ClientDetailTabs />}
    />
  )
}

export default ClientDetailPageHeader
