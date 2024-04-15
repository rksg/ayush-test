/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import _                          from 'lodash'
import moment                     from 'moment-timezone'
import { useIntl }                from 'react-intl'

import { Dropdown, Button, CaretDownSolidIcon, PageHeader, RangePicker, Tooltip } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                              from '@acx-ui/formatter'
import { SwitchCliSession, SwitchStatus, useSwitchActions }                       from '@acx-ui/rc/components'
import {
  useGetJwtTokenQuery,
  useLazyGetSwitchListQuery,
  useLazyGetSwitchVenueVersionListQuery
}                         from '@acx-ui/rc/services'
import {
  getStackUnitsMinLimitation,
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
import { filterByAccess, hasPermission, SwitchScopes } from '@acx-ui/user'
import { useDateFilter }                               from '@acx-ui/utils'

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

  const [getSwitchList] = useLazyGetSwitchListQuery()
  const [getSwitchVenueVersionList] = useLazyGetSwitchVenueVersionListQuery()
  const jwtToken = useGetJwtTokenQuery({ params: { tenantId, serialNumber } })

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncDataEndTime, setSyncDataEndTime] = useState('')
  const [cliModalState, setCliModalOpen] = useState(false)
  const [addStackMemberOpen, setAddStackMemberOpen] = useState(false)

  const [venueFW, setVenueFW] = useState('')
  const [venueAboveTenFw, setVenueAboveTenFw] = useState('')
  const [maxMembers, setMaxMembers] = useState(12)

  const isOperational = switchDetailHeader?.deviceStatus === SwitchStatusEnum.OPERATIONAL ||
    switchDetailHeader?.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
  const isStack = switchDetailHeader?.isStack || false
  const isSyncedSwitchConfig = switchDetailHeader?.syncedSwitchConfig

  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    switch(e.key) {
      case MoreActions.CLI_SESSION:
        setCliModalOpen(true)
        break
      case MoreActions.REBOOT:
        switchAction.showRebootSwitch(switchId || '', tenantId || '', isStack)
        break
      case MoreActions.DELETE:
        switchAction.showDeleteSwitch(switchDetailHeader, tenantId, () => navigate(linkToSwitch))
        break
      case MoreActions.SYNC_DATA:
        switchAction.doSyncData(switchId || '', tenantId || '', handleSyncData)
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
      (await getSwitchList({ params: { tenantId: tenantId }, payload }, false))
        .data?.data || []
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
    return switchDetail.venueName ?
      await getSwitchVenueVersionList({
        params: { tenantId }, payload: {
          firmwareType: '',
          firmwareVersion: '',
          searchString: switchDetail.venueName,
          updateAvailable: ''
        }
      }).unwrap()
        .then(result => {
          const venueFw = result?.data?.find(
            venue => venue.id === switchDetail.venueId)?.switchFirmwareVersion?.id || ''
          const venueAboveTenFw = result?.data?.find(
            venue => venue.id === switchDetail?.venueId)?.switchFirmwareVersionAboveTen?.id || ''

          setVenueFW(venueFw)
          setVenueAboveTenFw(venueAboveTenFw)

        }).catch((error) => {
          console.log(error) // eslint-disable-line no-console
        }) : {}
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
      const currentFW = switchDetailHeader?.firmwareVersion || venueFW || ''
      const currentAboveTenFW = switchDetailHeader?.firmwareVersion || venueAboveTenFw || ''
      const maxUnits = getStackUnitsMinLimitation(switchModel, currentFW, currentAboveTenFW)

      setMaxMembers(maxUnits - syncedStackMemberCount)
    }
  }, [switchDetailHeader, switchData, venueFW, venueAboveTenFw])

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

  const hasCreatePermission = hasPermission({ scopes: [SwitchScopes.CREATE] })
  const hasUpdatePermission = hasPermission({ scopes: [SwitchScopes.UPDATE] })
  const hasDeletaPermission = hasPermission({ scopes: [SwitchScopes.DELETE] })

  const menu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        ...(isSyncedSwitchConfig && hasUpdatePermission ? [{
          key: MoreActions.SYNC_DATA,
          disabled: isSyncing || !isOperational,
          label: <Tooltip placement='bottomRight' title={syncDataEndTime}>
            {$t({ defaultMessage: 'Sync Data' })}
          </Tooltip>
        }, {
          type: 'divider'
        }] : []),

        ...(isOperational && hasUpdatePermission ? [{
          key: MoreActions.REBOOT,
          label: isStack
            ? $t({ defaultMessage: 'Reboot Stack' })
            : $t({ defaultMessage: 'Reboot Switch' })
        }, {
          key: MoreActions.CLI_SESSION,
          label: $t({ defaultMessage: 'CLI Session' })
        }, {
          type: 'divider'
        }] : []),

        ...(isStack && (maxMembers > 0) && hasCreatePermission ? [{
          key: MoreActions.ADD_MEMBER,
          disabled: maxMembers === 0,
          label: $t({ defaultMessage: 'Add Member' })
        }] : []),

        ...(hasDeletaPermission ? [{
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
          />,
          ...filterByAccess([
            <Dropdown overlay={menu}
              scopeKey={[SwitchScopes.CREATE, SwitchScopes.DELETE, SwitchScopes.UPDATE]}>{() =>
                <Button>
                  <Space>
                    {$t({ defaultMessage: 'More Actions' })}
                    <CaretDownSolidIcon />
                  </Space>
                </Button>
              }</Dropdown>,
            <Button
              type='primary'
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
