/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Menu, MenuProps, Space } from 'antd'
import _                          from 'lodash'
import moment                     from 'moment-timezone'
import { useIntl }                from 'react-intl'

import { Dropdown, Button, CaretDownSolidIcon, PageHeader, RangePicker, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                              from '@acx-ui/formatter'
import { SwitchCliSession, SwitchStatus, useSwitchActions }                       from '@acx-ui/rc/components'
import { useGetJwtTokenQuery, useLazyGetSwitchListQuery }                         from '@acx-ui/rc/services'
import { SwitchRow, SwitchStatusEnum, SwitchViewModel }                           from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink,
  useParams
}                  from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { useDateFilter }  from '@acx-ui/utils'

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
  const { switchDetailHeader, currentSwitchOperational } = switchDetailsContextData

  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}`)
  const linkToSwitch = useTenantLink('/devices/switch/')

  const [getSwitchList] = useLazyGetSwitchListQuery()
  const jwtToken = useGetJwtTokenQuery({ params: { tenantId, serialNumber } })

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncDataEndTime, setSyncDataEndTime] = useState('')
  const [cliModalState, setCliModalOpen] = useState(false)
  const [addStackMemberOpen, setAddStackMemberOpen] = useState(false)

  const isOperational = switchDetailHeader?.deviceStatus === SwitchStatusEnum.OPERATIONAL
  const isStack = switchDetailHeader?.isStack || false
  const isSyncedSwitchConfig = switchDetailHeader?.syncedSwitchConfig
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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

  const menu = (
    <Menu onClick={handleMenuClick} >
      {isSyncedSwitchConfig &&
        <>
          <Menu.Item
            key={MoreActions.SYNC_DATA}
            disabled={isSyncing || !isOperational}>
            <Tooltip placement='bottomRight' title={syncDataEndTime}>
              {$t({ defaultMessage: 'Sync Data' })}
            </Tooltip>
          </Menu.Item>
          <Menu.Divider />
        </>}
      {isOperational &&
        <>
          <Menu.Item
            key={MoreActions.REBOOT} >
            {isStack ?
              $t({ defaultMessage: 'Reboot Stack' }) : $t({ defaultMessage: 'Reboot Switch' })}
          </Menu.Item>
          <Menu.Item
            key={MoreActions.CLI_SESSION}>
            {$t({ defaultMessage: 'CLI Session' })}
          </Menu.Item>
          <Menu.Divider />
        </>
      }
      {isStack &&
      <Menu.Item
        key={MoreActions.ADD_MEMBER}>
        {$t({ defaultMessage: 'Add Member' })}
      </Menu.Item>
      }
      <Menu.Item
        key={MoreActions.DELETE}>
        <Tooltip placement='bottomRight' title={syncDataEndTime}>
          {isStack ?
            $t({ defaultMessage: 'Delete Stack' }) : $t({ defaultMessage: 'Delete Switch' })}
        </Tooltip>
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      <PageHeader
        title={switchDetailHeader?.name || switchDetailHeader?.switchName || switchDetailHeader?.serialNumber || ''}
        titleExtra={
          <SwitchStatus row={switchDetailHeader as unknown as SwitchRow} showText={!currentSwitchOperational} />}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Switches' }) },
          { text: $t({ defaultMessage: 'Switch List' }), link: '/devices/switch' }
        ] : [{ text: $t({ defaultMessage: 'Switches' }), link: '/devices/switch' }]}
        extra={filterByAccess([
          !checkTimeFilterDisabled() && <RangePicker
            key='range-picker'
            selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
            onDateApply={setDateFilter as CallableFunction}
            showTimePicker
            selectionType={range}
          />,
          <Dropdown overlay={menu}>{() =>
            <Button>
              <Space>
                {$t({ defaultMessage: 'More Actions' })}
                <CaretDownSolidIcon />
              </Space>
            </Button>
          }</Dropdown>,
          <Button
            type='primary'
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
        ])}
        footer={<SwitchTabs switchDetail={switchDetailHeader as SwitchViewModel} />}
      />
      <SwitchCliSession
        modalState={cliModalState}
        setIsModalOpen={setCliModalOpen}
        serialNumber={serialNumber || ''}
        jwtToken={jwtToken.data?.access_token || ''}
        switchName={switchDetailHeader?.name || switchDetailHeader?.switchName || switchDetailHeader?.serialNumber || ''}
      />
      <AddStackMember visible={addStackMemberOpen} setVisible={setAddStackMemberOpen} />
    </>
  )
}

export default SwitchPageHeader
