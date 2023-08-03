import { useContext, useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, cssStr }                           from '@acx-ui/components'
import { useApViewModelQuery }                    from '@acx-ui/rc/services'
import { ApViewModel, LocationExtended }          from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink,
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'

import { ApEditContext, showUnsavedModal } from './index'

import type { History, Transition } from 'history'

const ApEditTabKeys = ['radio', 'networking', 'networkControl', 'advanced']

function ApEditTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/wifi/${params.serialNumber}/edit/`)
  const {
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData,
    editNetworkingContextData,
    setEditNetworkingContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData,
    editAdvancedContextData,
    setEditAdvancedContextData,
    setPreviousPath,
    setIsOnlyOneTab,
    setApViewContextData
  } = useContext(ApEditContext)

  const apViewModelPayload = {
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags',
      'apStatusData.afcInfo.powerMode', 'apStatusData.afcInfo.afcStatus','apRadioDeploy'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const { data: currentAP } = useApViewModelQuery({ params, payload: apViewModelPayload })

  setIsOnlyOneTab(!currentAP?.model)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const tabTitleMap = (tabkey: string) => {
    const tabTitle = {
      general: $t({ defaultMessage: 'General' }),
      radio: $t({ defaultMessage: 'Radio' }),
      networking: $t({ defaultMessage: 'Networking' }),
      networkControl: $t({ defaultMessage: 'Network Control' }),
      advanced: $t({ defaultMessage: 'Advanced' })
    }

    const title = tabTitle[tabkey as keyof typeof tabTitle]
    return editContextData?.isDirty && params?.activeTab === tabkey
      ? (<>{title}
        <span style={{ color: cssStr('--acx-accents-orange-50') }}> *</span>
      </>)
      : title
  }

  const location = useLocation()
  const { navigator } = useContext(NavigationContext)
  const blockNavigator = navigator as History
  const unblockRef = useRef<Function>()

  useEffect(() => {
    if (editContextData?.isDirty) {
      unblockRef.current?.()
      unblockRef.current = blockNavigator.block((tx: Transition) => {
        if (tx.location.hash) {
          return
        }
        // do not trigger modal twice
        setEditContextData({
          ...editContextData,
          isDirty: false
        })
        showUnsavedModal(
          editContextData,
          setEditContextData,
          editRadioContextData,
          setEditRadioContextData,
          editNetworkingContextData,
          setEditNetworkingContextData,
          editNetworkControlContextData,
          setEditNetworkControlContextData,
          editAdvancedContextData,
          setEditAdvancedContextData,
          tx.retry
        )
      })
    } else {
      unblockRef.current?.()
    }

    setApViewContextData(currentAP ?? {} as ApViewModel)
  }, [editContextData])

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])


  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={tabTitleMap('general')} key='general' />
      { typeof currentAP?.model !== 'undefined' && (
        ApEditTabKeys.map(tabKey => <Tabs.TabPane tab={tabTitleMap(tabKey)} key={tabKey} />)
      )}
    </Tabs>
  )
}

export default ApEditTabs
