import { useContext, useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import { Tabs, cssStr }                           from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { LocationExtended }                       from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'

import { usePathBasedOnConfigTemplate } from '../configTemplates'

import { ApGroupEditContext } from './context'

import { showUnsavedModal } from '.'

import type { History, Transition } from 'history'

export function ApGroupEditTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = usePathBasedOnConfigTemplate(`/devices/apgroups/${params.apGroupId}/edit/`)
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)

  const { editContextData, setEditContextData, setPreviousPath } = useContext(ApGroupEditContext)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  const ApGroupEditTabKeys = [
    'general',
    ...(isApGroupMoreParameterPhase1Enabled
      ? ['radio']
      : ['vlanRadio']
    )
  ]

  const tabTitleMap = (tabkey: string) => {
    const tabTitle = {
      general: $t({ defaultMessage: 'General' }),
      ...(isApGroupMoreParameterPhase1Enabled
        ? { radio: $t({ defaultMessage: 'Radio' }) }
        : { vlanRadio: $t({ defaultMessage: 'VLAN & Radio' }) }
      )
    }

    const title = tabTitle[tabkey as keyof typeof tabTitle]
    const { activeTab='general' } = params || {}

    return editContextData?.isDirty && activeTab === tabkey
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
          tx.retry
        )
      })
    } else {
      unblockRef.current?.()
    }

  }, [editContextData])


  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      {
        ApGroupEditTabKeys.map(tabKey => (
          <Tabs.TabPane tab={tabTitleMap(tabKey)} key={tabKey} />
        ))
      }
    </Tabs>
  )
}
