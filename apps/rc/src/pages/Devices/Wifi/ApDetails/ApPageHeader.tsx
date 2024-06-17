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
import {
  useApDetailHeaderQuery,
  isAPLowPower,
  useGetApCapabilitiesQuery
}                          from '@acx-ui/rc/services'
import {
  ApDetailHeader,
  ApDeviceStatusEnum,
  useApContext,
  ApStatus,
  Capabilities
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { WifiScopes }     from '@acx-ui/types'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { tenantId, serialNumber, apStatusData, afcEnabled, model } = useApContext()
  const { data } = useApDetailHeaderQuery({ params: { tenantId, serialNumber } })
  //eslint-disable-next-line
  const { data: capabilities } = useGetApCapabilitiesQuery({ params: { tenantId, serialNumber } })

  const apAction = useApActions()
  const { activeTab } = useParams()

  const AFC_Featureflag = useIsSplitOn(Features.AP_AFC_TOGGLE)

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
      }].filter(item => (currentApOperational || item.key === 'delete' ||
        (item.key === 'downloadLog' && status === ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED)
      ))}
    />
  )

  const enableTimeFilter = () =>
    !['clients', 'networks', 'troubleshooting'].includes(activeTab as string)

  const isAPOutdoor = (): boolean | undefined => {
    const typeCastCapabilities = capabilities as unknown as Capabilities ?? {}
    const currentApModel = typeCastCapabilities.apModels?.find((apModel) => apModel.model === model)
    return currentApModel?.isOutdoor
  }

  return (
    <PageHeader
      title={data?.title || ''}
      titleExtra={<APStatus status={status} showText={!currentApOperational} />}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Wi-Fi' }) },
        { text: $t({ defaultMessage: 'Access Points' }) },
        { text: $t({ defaultMessage: 'AP List' }), link: '/devices/wifi' }
      ]}
      extra={[
        enableTimeFilter()
          ? <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />
          : <></>,
        ...filterByAccess([
          <Dropdown
            scopeKey={[WifiScopes.DELETE, WifiScopes.UPDATE]}
            overlay={menu}>{()=>
              <Button>
                <Space>
                  {$t({ defaultMessage: 'More Actions' })}
                  <CaretDownSolidIcon />
                </Space>
              </Button>}
          </Dropdown>,
          <Button
            type='primary'
            scopeKey={[WifiScopes.UPDATE]}
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
        ])
      ]}
      footer={<>
        {
          AFC_Featureflag && afcEnabled &&
          isAPLowPower(ApStatusData?.afcInfo) &&
          <LowPowerBannerAndModal
            afcInfo={ApStatusData.afcInfo}
            from={'ap'}
            isOutdoor={isAPOutdoor()}
          />
        }
        <ApTabs apDetail={data as ApDetailHeader} />
      </>}
    />
  )
}

export default ApPageHeader
