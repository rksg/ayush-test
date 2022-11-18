import { Dropdown, Menu, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, DisabledButton, PageHeader } from '@acx-ui/components'
import { ArrowExpand, ClockOutlined }         from '@acx-ui/icons'

import ApDetailTabs from './ApDetailTabs'

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
        <DisabledButton key='date-filter' icon={<ClockOutlined />}>
          {$t({ defaultMessage: 'Last 24 Hours' })}
        </DisabledButton>,
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
