import { Dropdown, Menu, MenuProps, Space } from 'antd'
import { useIntl }                          from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { ClockOutlined, ArrowExpand } from '@acx-ui/icons'
import { useApActions }               from '@acx-ui/rc/components'
import { useApDetailHeaderQuery }     from '@acx-ui/rc/services'
import { ApDetailHeader }             from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, serialNumber } })
  const apAction = useApActions()

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${serialNumber}`)

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (!serialNumber) return

    const actionMap = {
      reboot: apAction.showRebootAp,
      downloadLog: apAction.showDownloadApLog,
      blinkLed: apAction.showBlinkLedAp,
      delete: apAction.showDeleteAp
    }

    actionMap[e.key as keyof typeof actionMap](serialNumber, tenantId)
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          label: $t({ defaultMessage: 'Reboot' }),
          key: 'reboot'
        },
        {
          label: $t({ defaultMessage: 'Download Log' }),
          key: 'downloadLog'
        },
        {
          label: $t({ defaultMessage: 'Blink LEDs' }),
          key: 'blinkLed'
        },
        {
          type: 'divider'
        },
        {
          label: $t({ defaultMessage: 'Delete AP' }),
          key: 'delete'
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
              pathname: `${basePath.pathname}/edit/details`
            })
          }
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ]}
      footer={<ApTabs apDetail={data as ApDetailHeader} />}
    />
  )
}

export default ApPageHeader
