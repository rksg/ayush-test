import {
  Menu,
  MenuProps,
  Space
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Dropdown, CaretDownSolidIcon, Button, PageHeader, RangePicker } from '@acx-ui/components'
import { Features, useIsSplitOn }                                        from '@acx-ui/feature-toggle'
import { APStatus, LowPowerBannerAndModal }                              from '@acx-ui/rc/components'
import { useApActions }                                                  from '@acx-ui/rc/components'
import { useApDetailHeaderQuery }                                        from '@acx-ui/rc/services'
import {
  ApDetailHeader,
  ApDeviceStatusEnum,
  useApContext,
  ApStatus,
  AFCPowerMode
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { tenantId, serialNumber, apStatusData } = useApContext()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, serialNumber } })
  const apAction = useApActions()
  const { activeTab } = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)
  const linkToWifi = useTenantLink('/devices/wifi/')

  const status = data?.headers.overview as ApDeviceStatusEnum
  const currentApOperational = status === ApDeviceStatusEnum.OPERATIONAL
  const ApStatusData = apStatusData as ApStatus
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

  const enableTimeFilter = () =>
    !['clients', 'networks', 'troubleshooting'].includes(activeTab as string)

  return (
    <PageHeader
      title={data?.title || ''}
      titleExtra={<APStatus status={status} showText={!currentApOperational} />}
      breadcrumb={isNavbarEnhanced ? [
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ] : [{ text: $t({ defaultMessage: 'Access Points' }), link: '/devices/wifi' }]}
      extra={filterByAccess([
        enableTimeFilter()
          ? <RangePicker
            key='date-filter'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />
          : <></>,
        <Dropdown overlay={menu}>{()=>
          <Button>
            <Space>
              {$t({ defaultMessage: 'More Actions' })}
              <CaretDownSolidIcon />
            </Space>
          </Button>
        }</Dropdown>,
        <Button
          type='primary'
          onClick={() => {
            navigate({
              ...basePath,
              pathname: `${basePath.pathname}/edit/general`
            }, {
              state: {
                from: location
              }
            })
          }}
        >{$t({ defaultMessage: 'Configure' })}</Button>
      ])}
      footer={<>
        {/* TODO: Remove the condition */}
        {(true || ApStatusData.afcInfo?.powerMode === AFCPowerMode.LOW_POWER) &&
          <LowPowerBannerAndModal parent='ap' />}
        <ApTabs apDetail={data as ApDetailHeader} />
      </>}
    />
  )
}

export default ApPageHeader
