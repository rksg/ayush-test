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
import { useApActions }                    from '@acx-ui/rc/components'
import { useApDetailHeaderQuery }          from '@acx-ui/rc/services'
import {
  ApDetailHeader,
  ApDeviceStatusEnum
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { dateRangeForLast, useDateFilter } from '@acx-ui/utils'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { tenantId, serialNumber } = useParams()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, serialNumber } })
  const apAction = useApActions()

  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${serialNumber}`)

  const currentApOperational = data?.headers.overview === ApDeviceStatusEnum.OPERATIONAL

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
      items={currentApOperational ? [{
        label: $t({ defaultMessage: 'Reboot' }),
        key: 'reboot'
      }, {
        label: $t({ defaultMessage: 'Download Log' }),
        key: 'downloadLog'
      }, {
        label: $t({ defaultMessage: 'Blink LEDs' }),
        key: 'blinkLed'
      }, {
        type: 'divider'
      }, {
        label: $t({ defaultMessage: 'Delete AP' }),
        key: 'delete'
      }] : [{
        label: $t({ defaultMessage: 'Delete AP' }),
        key: 'delete'
      }]}
    />
  )
  return (
    <PageHeader
      title={data?.title || ''}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Access Points' }), link: '/devices/aps' }
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
