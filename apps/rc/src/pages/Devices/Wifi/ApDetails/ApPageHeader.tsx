import {
  Menu,
  MenuProps,
  Space
} from 'antd'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Dropdown, CaretDownSolidIcon, Button, PageHeader, RangePicker, getDefaultEarliestStart } from '@acx-ui/components'
import { get }                                                                                    from '@acx-ui/config'
import { Features, useIsSplitOn }                                                                 from '@acx-ui/feature-toggle'
import { APStatus, LowPowerBannerAndModal }                                                       from '@acx-ui/rc/components'
import { useApActions }                                                                           from '@acx-ui/rc/components'
import {
  useApDetailHeaderQuery,
  isAPLowPower,
  useApViewModelQuery
}                          from '@acx-ui/rc/services'
import {
  ApDetailHeader,
  ApDeviceStatusEnum,
  useApContext,
  ApStatus,
  PowerSavingStatusEnum,
  WifiRbacUrlsInfo
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { RolesEnum, WifiScopes }                   from '@acx-ui/types'
import { hasRoles, hasPermission, filterByAccess } from '@acx-ui/user'
import { getOpsApi, useDateFilter }                from '@acx-ui/utils'

import { useGetApCapabilities } from '../hooks'

import ApTabs from './ApTabs'

function ApPageHeader () {
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const AFC_Featureflag = get('AFC_FEATURE_ENABLED').toLowerCase() === 'true'

  const { $t } = useIntl()
  const { startDate, endDate, setDateFilter, range } =
    useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
  const { tenantId, serialNumber, apStatusData, afcEnabled, venueId, model } = useApContext()
  const params = { venueId, serialNumber }
  const { data } = useApDetailHeaderQuery({ params })

  const { data: apCapabilities } = useGetApCapabilities({
    params,
    modelName: model,
    enableRbac: isUseRbacApi
  })

  const isOutdoorAp = apCapabilities?.isOutdoor

  const apAction = useApActions()
  const { activeTab } = useParams()
  const apViewModelPayload = {
    entityType: 'aps',
    fields: ['powerSavingStatus'],
    filters: { serialNumber: [serialNumber] }
  }

  const apViewModelQuery = useApViewModelQuery({
    payload: apViewModelPayload,
    enableRbac: isUseRbacApi
  })
  const powerSavingStatus = apViewModelQuery.data?.powerSavingStatus as PowerSavingStatusEnum

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/devices/wifi/${serialNumber}`)
  const linkToWifi = useTenantLink('/devices/wifi/')
  const isReadOnly = hasRoles([RolesEnum.READ_ONLY])
  // eslint-disable-next-line max-len
  const operationRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
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
      // eslint-disable-next-line max-len
      (actionMap[e.key as keyof typeof actionMap] as typeof actionMap['reboot'])(serialNumber, tenantId, venueId)
    }
  }

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={(isReadOnly ? [{
        label: $t({ defaultMessage: 'Download Log' }),
        key: 'downloadLog',
        scopeKey: [WifiScopes.READ],
        roles: [RolesEnum.READ_ONLY]
      }, {
        label: $t({ defaultMessage: 'Blink LEDs' }),
        key: 'blinkLed',
        scopeKey: [WifiScopes.READ],
        roles: [RolesEnum.READ_ONLY]
      }] : [{
        label: $t({ defaultMessage: 'Reboot' }),
        key: 'reboot',
        scopeKey: [WifiScopes.UPDATE],
        rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.updateAp)],
        roles: operationRoles
      }, {
        label: $t({ defaultMessage: 'Download Log' }),
        key: 'downloadLog',
        scopeKey: [WifiScopes.READ],
        roles: [RolesEnum.READ_ONLY, ...operationRoles]
      }, {
        label: $t({ defaultMessage: 'Blink LEDs' }),
        key: 'blinkLed',
        scopeKey: [WifiScopes.READ],
        roles: [RolesEnum.READ_ONLY, ...operationRoles]
      }, {
        type: 'divider',
        key: 'divider'
      }, {
        label: $t({ defaultMessage: 'Delete AP' }),
        key: 'delete',
        scopeKey: [WifiScopes.DELETE],
        rbacOpsIds: [getOpsApi(WifiRbacUrlsInfo.deleteAp)],
        roles: operationRoles
      }]).filter(item => {
        const { scopeKey: scopes, rbacOpsIds, roles } = item
        const isHasPermission = hasPermission({ scopes, rbacOpsIds, roles })
        return (
          (currentApOperational && isHasPermission) ||
          (item.key === 'delete' && isHasPermission) ||
          (item.key === 'downloadLog' && status === ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED)
        )
      })}
    />
  )

  const enableTimeFilter = () =>
    !['clients', 'networks', 'troubleshooting'].includes(activeTab as string)

  const dropdown = [<Dropdown
    scopeKey={[WifiScopes.READ, WifiScopes.DELETE, WifiScopes.UPDATE]}
    overlay={menu}>{()=>
      <Button>
        <Space>
          {$t({ defaultMessage: 'More Actions' })}
          <CaretDownSolidIcon />
        </Space>
      </Button>}
  </Dropdown>]

  return (
    <PageHeader
      title={data?.title || ''}
      titleExtra={
        <APStatus
          status={status}
          showText={!currentApOperational}
          powerSavingStatus={powerSavingStatus}
        />
      }
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
            maxMonthRange={isDateRangeLimit ? 1 : 3}
          />
          : <></>,
        ...((isReadOnly) ? dropdown : filterByAccess(dropdown)),
        ...filterByAccess([
          <Button
            type='primary'
            scopeKey={[WifiScopes.UPDATE]}
            rbacOpsIds={[getOpsApi(WifiRbacUrlsInfo.updateAp)]}
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
            isOutdoor={isOutdoorAp}
          />
        }
        <ApTabs apDetail={data as ApDetailHeader} />
      </>}
    />
  )
}

export default ApPageHeader
