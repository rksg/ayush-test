import {
  Dropdown,
  Menu,
  MenuProps,
  Space
} from 'antd'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import { Button, PageHeader, RangePicker } from '@acx-ui/components'
import { ArrowExpand }                     from '@acx-ui/icons'
import { APStatus }                        from '@acx-ui/rc/components'
import { useApActions }                    from '@acx-ui/rc/components'
import { useApDetailHeaderQuery }          from '@acx-ui/rc/services'
import {
  ApDetailHeader,
  ApDeviceStatusEnum
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { dateRangeForLast, useDateFilter } from '@acx-ui/utils'

import { useApContext } from './ApContext'
import ApTabs           from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { tenantId, serialNumber } = useApContext()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, serialNumber } })
  const apAction = useApActions()

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)
  const linkToWifi = useTenantLink('/devices/wifi/')

  const status = data?.headers.overview as ApDeviceStatusEnum
  const currentApOperational = status === ApDeviceStatusEnum.OPERATIONAL

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (!serialNumber) return

    const actionMap = {
      reboot: apAction.showRebootAp,
      downloadLog: apAction.showDownloadApLog,
      blinkLed: apAction.showBlinkLedAp,
      delete: apAction.showDeleteAp
    }

    if (e.key === 'delete') {
      actionMap['delete'](serialNumber, tenantId, () => navigate(linkToWifi))
    } else {
      actionMap[e.key as keyof typeof actionMap](serialNumber, tenantId)
    }
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[{
        label: $t({ defaultMessage: 'Reboot' }),
        key: 'reboot'
      }, {
        label: $t({ defaultMessage: 'Download Log' }),
        key: 'downloadLog'
      }, {
        label: $t({ defaultMessage: 'Blink LEDs' }),
        key: 'blinkLed'
      }, {
        type: 'divider',
        key: 'divider'
      }, {
        label: $t({ defaultMessage: 'Delete AP' }),
        key: 'delete'
      }].filter(item => currentApOperational || item.key === 'delete')}
    />
  )

  return (
    <PageHeader
      title={data?.title || ''}
      titleExtra={<APStatus status={status} showText={!currentApOperational} />}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/wifi' }
      ]}
      extra={[
        <RangePicker
          key='date-filter'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={dateRangeForLast(3,'months')}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />,
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
