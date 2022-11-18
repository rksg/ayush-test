import { Badge, Dropdown, Menu, Space } from 'antd'
import { useIntl }                      from 'react-intl'

import { Button, deviceStatusColors, PageHeader } from '@acx-ui/components'
import { ClockOutlined, ArrowExpand }             from '@acx-ui/icons'
import { useApDetailHeaderQuery }                 from '@acx-ui/rc/services'
import {
  ApDetailHeader,
  ApDeviceStatusEnum,
  APView,
  transformApStatus
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const intl = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, serialNumber } })

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${serialNumber}`)

  const status = data?.headers.overview as ApDeviceStatusEnum
  const currentApOperational = status === ApDeviceStatusEnum.OPERATIONAL

  // const handleMenuClick: MenuProps['onClick'] = (e) => { TODO:
  //   // console.log('click', e)
  // }

  const menu = (
    <Menu
      // onClick={handleMenuClick}
      items={[
        {
          label: intl.$t({ defaultMessage: 'Reboot' }),
          key: '1'
        },
        {
          label: intl.$t({ defaultMessage: 'Download Log' }),
          key: '2'
        },
        {
          label: intl.$t({ defaultMessage: 'Blink LEDs' }),
          key: '3'
        },
        {
          type: 'divider'
        },
        {
          label: intl.$t({ defaultMessage: 'Delete AP' }),
          key: '4'
        }
      ]}
    />
  )

  const APStatus = function () {
    const apStatus = transformApStatus(intl, status, APView.AP_LIST)
    return <Badge color={`var(${deviceStatusColors[apStatus.deviceStatus]})`}
      text={currentApOperational ? '' : apStatus.message}/>
  }

  return (
    <PageHeader
      title={data?.title || ''}
      titleExtra={<APStatus />}
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Access Points' }), link: '/devices/aps' }
      ]}
      extra={[
        <Button key='date-filter' icon={<ClockOutlined />}>
          {intl.$t({ defaultMessage: 'Last 24 Hours' })}
        </Button>,
        <Dropdown overlay={menu} key='actionMenu'>
          <Button>
            <Space>
              {intl.$t({ defaultMessage: 'More Actions' })}
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
        >{intl.$t({ defaultMessage: 'Configure' })}</Button>
      ]}
      footer={<ApTabs apDetail={data as ApDetailHeader} />}
    />
  )
}

export default ApPageHeader
