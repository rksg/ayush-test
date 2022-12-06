import { Dropdown, Menu, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { ClockOutlined, ArrowExpand } from '@acx-ui/icons'
import { useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { SwitchViewModel }            from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'

import SwitchTabs from './SwitchTabs'

function SwitchPageHeader () {
  const { $t } = useIntl()
  const { tenantId, switchId, serialNumber } = useParams()
  const { data } = useSwitchDetailHeaderQuery({ params: { tenantId, switchId, serialNumber } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}`)

  // const handleMenuClick: MenuProps['onClick'] = (e) => { TODO:
  //   // console.log('click', e)
  // }

  const menu = (
    <Menu
      // onClick={handleMenuClick}
      items={[
        {
          label: $t({ defaultMessage: 'Sync Data' }),
          key: '1'
        },
        {
          type: 'divider'
        },
        {
          label: $t({ defaultMessage: 'Reboot Switch' }),
          key: '2'
        },
        {
          label: $t({ defaultMessage: 'CLI Session' }),
          key: '3'
        },
        {
          type: 'divider'
        },
        {
          label: $t({ defaultMessage: 'Delete Switch' }),
          key: '4'
        }
      ]}
    />
  )
  return (
    <PageHeader
      title={data?.name || data?.switchName || data?.serialNumber || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Switches' }), link: '/devices/switch' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>
          {$t({ defaultMessage: 'Last 24 Hours' })}
        </Button>,
        <Dropdown overlay={menu} key='actionMenu'>
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
      footer={<SwitchTabs switchDetail={data as SwitchViewModel} />}
    />
  )
}

export default SwitchPageHeader