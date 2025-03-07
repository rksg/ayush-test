/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import _                          from 'lodash'
import moment                     from 'moment-timezone'
import { useIntl }                from 'react-intl'

import { Dropdown, Button, CaretDownSolidIcon, PageHeader, RangePicker, Tooltip, getDefaultEarliestStart } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                          from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                                       from '@acx-ui/formatter'
import { SwitchCliSession, SwitchStatus, useSwitchActions }                                                from '@acx-ui/rc/components'
import {
  useGetJwtTokenQuery,
  useLazyGetSwitchListQuery,
  useLazyGetSwitchVenueVersionListQuery,
  useLazyGetSwitchVenueVersionListV1001Query
}                         from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenueVersionsV1002,
  getStackUnitsMinLimitation,
  getStackUnitsMinLimitationV1002,
  getSwitchModelGroup,
  SwitchRbacUrlsInfo,
  SwitchRow,
  SwitchStatusEnum,
  SwitchViewModel
}                           from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'
import { SwitchScopes }                                        from '@acx-ui/types'
import { filterByAccess, hasAllowedOperations, hasPermission } from '@acx-ui/user'
import { getOpsApi, useDateFilter }                            from '@acx-ui/utils'

import AddStackMember from './AddStackMember'
import SwitchTabs     from './SwitchTabs'


import { SwitchDetailsContext } from '.'

enum MoreActions {
SYNC_DATA = 'SYNC_DATA',
REBOOT = 'REBOOT',
CLI_SESSION = 'CLI_SESSION',
DELETE = 'DELETE',
ADD_MEMBER = 'ADD_MEMBER'
}


function SwitchPageHeader () {
  const { $t } = useIntl()
  const { switchId, serialNumber, tenantId, activeTab, activeSubTab } = useParams()
  const switchAction = useSwitchActions()
  const {
    switchDetailsContextData
  } = useContext(SwitchDetailsContext)
  const { switchData, switchDetailHeader, currentSwitchOperational } = switchDetailsContextData

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}`)
  const linkToSwitch = useTenantLink('/devices/switch/')

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchFirmwareV1002Enabled = useIsSplitOn(Features.SWITCH_FIRMWARE_V1002_TOGGLE)
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)

  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [getSwitchVenueVersionList] = useLazyGetSwitchVenueVersionListQuery()
  const [getSwitchVenueVersionListV1001] = useLazyGetSwitchVenueVersionListV1001Query()
  const jwtToken = useGetJwtTokenQuery({
    params: { tenantId, serialNumber, venueId: switchDetailHeader?.venueId },
    enableRbac: isSwitchRbacEnabled
  }, {
    skip: !switchDetailHeader?.venueId
  })

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncDataEndTime, setSyncDataEndTime] = useState('')
  const [cliModalState, setCliModalOpen] = useState(false)
  const [addStackMemberOpen, setAddStackMemberOpen] = useState(false)

  const [venueFW, setVenueFW] = useState('')
  const [venueAboveTenFw, setVenueAboveTenFw] = useState('')
  const [venueFwV1002, setVenueFwV1002] = useState([] as FirmwareSwitchVenueVersionsV1002[])

  const [maxMembers, setMaxMembers] = useState(12)

  const isOperational = switchDetailHeader?.deviceStatus === SwitchStatusEnum.OPERATIONAL ||
    switchDetailHeader?.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
  const isStack = switchDetailHeader?.isStack || false
  const isSyncedSwitchConfig = switchDetailHeader?.syncedSwitchConfig

  const { startDate, endDate, setDateFilter, range } =
    useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch(e.key) {
      case MoreActions.CLI_SESSION:
        setCliModalOpen(true)
        break
      case MoreActions.REBOOT:
        switchAction.showRebootSwitch(switchId || '', switchDetailHeader.venueId || '', tenantId || '', isStack)
        break
      case MoreActions.DELETE:
        switchAction.showDeleteSwitch(switchDetailHeader, tenantId, () => navigate(linkToSwitch))
        break
      case MoreActions.SYNC_DATA:
        switchAction.doSyncData(switchId || '', switchDetailHeader.venueId || '', tenantId || '', handleSyncData)
        setIsSyncing(true)
        break
      case MoreActions.ADD_MEMBER:
        setAddStackMemberOpen(true)
        break
    }
  }

  const handleSyncData = async () => {
    const payload = {
      fields: ['syncDataId', 'syncDataEndTime', 'syncedSwitchConfig', 'configReady', 'deviceStatus', 'cliApplied', 'id'],
      pageSize: 10,
      filters: {
        switchMac: [switchDetailHeader?.switchMac]
      }
    }
    const list =
      (await getSwitchList({
        params: { tenantId: tenantId },
        payload,
        enableRbac: isSwitchRbacEnabled }, false)).data?.data || []
    if (list.length > 0) {
      handleSyncButton(list[0].syncDataEndTime || '', !_.isEmpty(list[0].syncDataId))
    }
  }

  const handleSyncButton = (value: string, isSync: boolean) => {
    let result = value
    if (isSync) {
      result = $t({ defaultMessage: 'Sync data operation in progress...' })
      refetchResult()
    } else if (!_.isEmpty(value)) {
      result = `${$t({ defaultMessage: 'Last synced at ' })} ${
        formatter(DateFormatEnum.DateTimeFormatWithSeconds)(value)}`
    }
    setIsSyncing(isSync)
    setSyncDataEndTime(result)
  }

  const checkTimeFilterDisabled = () => {
    switch(activeTab){
      case 'overview':
        if(typeof activeSubTab === 'undefined'){
          return false
        }
        return activeSubTab !== 'panel'
      case 'troubleshooting':
      case 'clients':
      case 'configuration':
      case 'dhcp':
        return true
      default:
        return false
    }
  }

  const setVenueVersion = async (switchDetail: SwitchViewModel) => {
    if(switchDetail.venueName){
      if(isSwitchFirmwareV1002Enabled) {
        return await getSwitchVenueVersionListV1001({
          params: { tenantId },
          payload: {
            firmwareType: '',
            firmwareVersion: '',
            searchString: switchDetail.venueName,
            updateAvailable: ''
          },
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
          .then(result => {
            const venueFw = result?.data?.find(
              venue => venue.venueId === switchDetail.venueId)?.versions || []
            setVenueFwV1002(venueFw)

          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })

      } else {
        return await getSwitchVenueVersionList({
          params: { tenantId },
          payload: {
            firmwareType: '',
            firmwareVersion: '',
            searchString: switchDetail.venueName,
            updateAvailable: ''
          },
          enableRbac: isSwitchRbacEnabled
        }).unwrap()
          .then(result => {
            const venueId = isSwitchRbacEnabled ? 'venueId' : 'id'
            const venueFw = result?.data?.find(
              venue => venue[venueId] === switchDetail.venueId)?.switchFirmwareVersion?.id || ''
            const venueAboveTenFw = result?.data?.find(
              venue => venue[venueId] === switchDetail?.venueId)?.switchFirmwareVersionAboveTen?.id || ''

            setVenueFW(venueFw)
            setVenueAboveTenFw(venueAboveTenFw)

          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })
      }
    }
    return {}
  }

  useEffect(() => {
    if (switchDetailHeader?.stackMembers) {
      setVenueVersion(switchDetailHeader)
    }
  }, [switchDetailHeader])

  useEffect(() => {
    if(switchDetailHeader?.stackMembers){
      const switchModel = switchDetailHeader?.model || ''
      const syncedStackMemberCount = switchData?.stackMembers?.length || 0
      const currentFW = switchDetailHeader?.firmware || venueFW || ''
      const currentAboveTenFW = switchDetailHeader?.firmware || venueAboveTenFw || ''
      let maxUnits = getStackUnitsMinLimitation(switchModel, currentFW, currentAboveTenFW)
      if (isSwitchFirmwareV1002Enabled && venueFwV1002.length > 0) {
        const mg = getSwitchModelGroup(switchModel)
        const currentVersion = switchDetailHeader?.firmware || venueFwV1002?.find(v =>
          v.modelGroup === mg)?.version || ''
        maxUnits = getStackUnitsMinLimitationV1002(switchModel, currentVersion)
      }

      setMaxMembers(maxUnits - syncedStackMemberCount)
    }
  }, [switchDetailHeader, switchData, venueFW, venueAboveTenFw, venueFwV1002])

  useEffect(() => {
    if (switchDetailHeader?.switchMac) {
      handleSyncData()
    }
  }, [switchDetailHeader?.switchMac])

  const refetchResult = function () {
    setTimeout(() => {
      handleSyncData()
    }, 3000)
  }

  const hasUpdatePermission = hasPermission({
    scopes: [SwitchScopes.UPDATE] })
  const hasDeletPermission = hasPermission({
    scopes: [SwitchScopes.DELETE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteSwitches)]
  })
  const showAddMember = isStack && (maxMembers > 0) && hasUpdatePermission &&
    hasAllowedOperations([getOpsApi(SwitchRbacUrlsInfo.updateSwitch)])
  const showDivider = (hasUpdatePermission && (isSyncedSwitchConfig || isOperational))
    && (showAddMember || hasDeletPermission) &&
    hasAllowedOperations([
      getOpsApi(SwitchRbacUrlsInfo.reboot),
      getOpsApi(SwitchRbacUrlsInfo.syncData)
    ])

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        ...(isSyncedSwitchConfig && hasUpdatePermission &&
             hasAllowedOperations([getOpsApi(SwitchRbacUrlsInfo.syncData)]) ? [{
            key: MoreActions.SYNC_DATA,
            disabled: isSyncing || !isOperational,
            label: <Tooltip placement='bottomRight' title={syncDataEndTime}>
              {$t({ defaultMessage: 'Sync Data' })}
            </Tooltip>
          }, {
            type: 'divider'
          }] : []),

        ...(isOperational && hasUpdatePermission &&
          hasAllowedOperations([getOpsApi(SwitchRbacUrlsInfo.reboot)]) ? [{
            key: MoreActions.REBOOT,
            label: isStack
              ? $t({ defaultMessage: 'Reboot Stack' })
              : $t({ defaultMessage: 'Reboot Switch' })
          }, {
            key: MoreActions.CLI_SESSION,
            label: $t({ defaultMessage: 'CLI Session' })
          }] : []),

        ...(showDivider ? [{
          type: 'divider'
        }] : [] ),

        ...(showAddMember ? [{
          key: MoreActions.ADD_MEMBER,
          disabled: maxMembers === 0,
          label: $t({ defaultMessage: 'Add Member' })
        }] : []),

        ...(hasDeletPermission ? [{
          key: MoreActions.DELETE,
          label: <Tooltip placement='bottomRight' title={syncDataEndTime}>
            {isStack ?
              $t({ defaultMessage: 'Delete Stack' }) : $t({ defaultMessage: 'Delete Switch' })}
          </Tooltip>
        }] : [])
      ] as ItemType[]
      }/>
  )

  return (
    <>
      <PageHeader
        title={
          switchDetailHeader?.name
          || switchDetailHeader?.switchName
          || switchDetailHeader?.serialNumber
          || ''
        }
        titleExtra={
          <SwitchStatus
            row={switchDetailHeader as unknown as SwitchRow}
            showText={!currentSwitchOperational ||
              (switchDetailHeader.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL)}
          />}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Switches' }) },
          { text: $t({ defaultMessage: 'Switch List' }), link: '/devices/switch' }
        ]}
        extra={[
          !checkTimeFilterDisabled() && <RangePicker
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
            maxMonthRange={isDateRangeLimit ? 1 : 3}
          />,
          ...filterByAccess([
            isOperational ? <Dropdown overlay={menu}
              rbacOpsIds={[
                getOpsApi(SwitchRbacUrlsInfo.updateSwitch),
                getOpsApi(SwitchRbacUrlsInfo.deleteSwitches),
                getOpsApi(SwitchRbacUrlsInfo.reboot),
                getOpsApi(SwitchRbacUrlsInfo.syncData)
              ]}
              scopeKey={[SwitchScopes.DELETE, SwitchScopes.UPDATE]}>{() =>
                <Button>
                  <Space>
                    {$t({ defaultMessage: 'More Actions' })}
                    <CaretDownSolidIcon />
                  </Space>
                </Button>
              }</Dropdown>: null,
            <Button
              type='primary'
              rbacOpsIds={[getOpsApi(SwitchRbacUrlsInfo.updateSwitch)]}
              scopeKey={[SwitchScopes.UPDATE]}
              onClick={() =>
                navigate({
                  ...basePath,
                  pathname: `${basePath.pathname}${switchDetailHeader?.isStack ? '/stack' : ''}/edit`
                }, {
                  state: {
                    from: location
                  }
                })
              }
            >{$t({ defaultMessage: 'Configure' })}</Button>
          ])
        ]}
        footer={<SwitchTabs switchDetail={switchDetailHeader as SwitchViewModel} />}
      />
      <SwitchCliSession
        modalState={cliModalState}
        setIsModalOpen={setCliModalOpen}
        serialNumber={serialNumber || ''}
        jwtToken={jwtToken.data?.access_token || ''}
        switchName={switchDetailHeader?.name || switchDetailHeader?.switchName || switchDetailHeader?.serialNumber || ''}
      />
      <AddStackMember
        visible={addStackMemberOpen}
        setVisible={setAddStackMemberOpen}
        maxMembers={maxMembers}
        venueFirmwareVersion={venueFW}
      />
    </>
  )
}

export default SwitchPageHeader
