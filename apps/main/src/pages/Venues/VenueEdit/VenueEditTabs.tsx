import { useContext, useEffect, useRef } from 'react'

import { Tabs }    from 'antd'
import { useIntl } from 'react-intl'

import {
  useNavigate,
  useParams,
  useTenantLink,
  UNSAFE_NavigationContext as NavigationContext
} from '@acx-ui/react-router-dom'

import { VenueEditContext, EditContext, showUnsavedModal } from './index'

import type { History, Transition } from 'history'

function VenueEditTabs () {
  const intl = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/venues/${params.venueId}/edit/`)
  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    editSecurityContextData
  } = useContext(VenueEditContext)
  const onTabChange = (tab: string) => {
    if (tab === 'wifi') tab = `${tab}/radio`
    if (tab === 'switch') tab = `${tab}/general`

    setEditContextData({} as EditContext)
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
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
          editNetworkingContextData,
          editSecurityContextData,
          intl,
          tx.retry
        )
      })
    } else {
      unblockRef.current?.()
    }
  }, [editContextData])

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={intl.$t({ defaultMessage: 'Venue Details' })} key='details' />
      <Tabs.TabPane tab={intl.$t({ defaultMessage: 'Wi-Fi Configuration' })} key='wifi' />
      <Tabs.TabPane tab={intl.$t({ defaultMessage: 'Switch Configuration' })} key='switch' />
    </Tabs>
  )
}

export default VenueEditTabs
