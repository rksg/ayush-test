import { Dropdown, Menu, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { ClockOutlined, ArrowExpand } from '@acx-ui/icons'
import { useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'
import {
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { data } = useVenueDetailsHeaderQuery({ params: { tenantId, venueId } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${venueId}`)

  // const handleMenuClick: MenuProps['onClick'] = (e) => { TODO:
  //   // console.log('click', e)
  // }

  const menu = (
    <Menu
      // onClick={handleMenuClick}
      items={[
        {
          label: $t({ defaultMessage: 'Reboot' }),
          key: '1'
        },
        {
          label: $t({ defaultMessage: 'Download Log' }),
          key: '2'
        },
        {
          label: $t({ defaultMessage: 'Blink LEDs' }),
          key: '3'
        },
        {
          type: 'divider'
        },
        {
          label: $t({ defaultMessage: 'Delete AP' }),
          key: '4'
        }
      ]}
    />
  )
  return (
    <PageHeader
      title={data?.venue?.name || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/aps' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>
          {$t({ defaultMessage: 'Last 24 Hours' })}
        </Button>,
        <Dropdown overlay={menu}>
          <Button>
            <Space>
              {$t({ defaultMessage: 'More Actions' })}
              <ArrowExpand />
            </Space>
          </Button>
        </Dropdown>,
        <Button
          key='configure'
          type='primary'
          onClick={() =>
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit/details`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ]}
      footer={<ApTabs />}
    />
  )
}

export default ApPageHeader
