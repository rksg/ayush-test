import { Dropdown, Menu, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { ClockOutlined, ArrowExpand } from '@acx-ui/icons'
import { useApDetailHeaderQuery }     from '@acx-ui/rc/services'
import { ApDetailHeader }             from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { tenantId, apId } = useParams()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, apId } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${apId}`)

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
      title={data?.title || ''}
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
              pathname: `${basePath.pathname}/edit`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ]}
      footer={<ApTabs apDetail={data as ApDetailHeader} />}
    />
  )
}

export default ApPageHeader
