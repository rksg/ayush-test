import { useContext, useEffect, useRef } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import {
  useNavigate,
  useParams,
  useTenantLink,
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'

import { VenueEditContext, showUnsavedModal } from './index'

import type { History, Transition } from 'history'

function VenueEditTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/venues/${params.venueId}/edit/`)
  const navigate = useNavigate()
  const { editContextData, setEditContextData } = useContext(VenueEditContext)
  const onTabChange = (tab: string) => {
    const subTab = tab === 'wifi' ? 'radio' : (tab === 'switch' ? 'general' : 'details')
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}/${subTab}`
    })
  }

  const { navigator } = useContext(NavigationContext)
  const blockNavigator = navigator as History
  const unblockRef = useRef<Function>()
  useEffect(() => {
    if (editContextData.isDirty) {
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
          tx.retry
        )
      })
    } else {
      unblockRef.current?.()
    }
  }, [editContextData.isDirty])

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Venue Details' })} key='details' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Wi-Fi Configuration' })} key='wifi' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Switch Configuration' })} key='switch' />
    </Tabs>
  )
}

export default VenueEditTabs