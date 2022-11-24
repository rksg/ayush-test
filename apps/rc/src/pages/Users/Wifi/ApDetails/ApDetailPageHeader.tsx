import { Dropdown, Menu, Space } from 'antd'
import moment                    from 'moment'
import { useIntl }               from 'react-intl'

import { Button, DisabledButton, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { ArrowExpand, ClockOutlined }                      from '@acx-ui/icons'
import { dateRangeForLast, useDateFilter }                 from '@acx-ui/utils'

import ApDetailTabs from './ApDetailTabs'

function DatePicker () {
  const { $t } = useIntl()
  const enableVenueAnalytics = useIsSplitOn(Features.VENUE_ANALYTICS)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return (enableVenueAnalytics)
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


function ApDetailPageHeader () {
  const { $t } = useIntl()
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
      title={$t({ defaultMessage: 'User-1' })}
      // TODO: navigate to /users/aps/{userType}
      breadcrumb={[
        { text: $t({ defaultMessage: 'WiFi Users' }), link: '/users' }
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
      footer={<ApDetailTabs />}
    />
  )
}

export default ApDetailPageHeader
