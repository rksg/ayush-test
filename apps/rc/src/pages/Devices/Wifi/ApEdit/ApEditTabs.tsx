import { useContext, useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                   from '@acx-ui/components'
import { useApViewModelQuery }                    from '@acx-ui/rc/services'
import { ApVenueStatusEnum }                      from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink,
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'

import { ApEditContext, showUnsavedModal } from './index'

import type { History, Transition } from 'history'

function ApEditTabs () {
  const intl = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${params.serialNumber}/edit/`)
  const {
    editContextData,
    setEditContextData,
    editRadioContextData
  } = useContext(ApEditContext)

  const apViewModelPayload = {
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const { data: currentAP } = useApViewModelQuery({ params, payload: apViewModelPayload })

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const { navigator } = useContext(NavigationContext)
  const blockNavigator = navigator as History
  const unblockRef = useRef<Function>()

  useEffect(() => {
    if (editContextData?.isDirty) {
      unblockRef.current?.()
      unblockRef.current = blockNavigator.block((tx: Transition) => {
        // do not trigger modal twice
        setEditContextData({
          ...editContextData,
          isDirty: false
        })
        showUnsavedModal(
          editContextData,
          setEditContextData,
          editRadioContextData,
          tx.retry
        )
      })
    } else {
      unblockRef.current?.()
    }
  }, [editContextData])

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={intl.$t({ defaultMessage: 'AP Details' })} key='details' />
      { currentAP?.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL
        && <Tabs.TabPane tab={intl.$t({ defaultMessage: 'Settings' })} key='settings' /> }
    </Tabs>
  )
}

export default ApEditTabs
