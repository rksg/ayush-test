import { createContext, useState } from 'react'

import { useParams } from '@acx-ui/react-router-dom'

import { SwitchConfigTab } from './SwitchConfigTab'
import { VenueDetailsTab } from './VenueDetailsTab'
import VenueEditPageHeader from './VenueEditPageHeader'
import { WifiConfigTab }   from './WifiConfigTab'

const tabs = {
  details: VenueDetailsTab,
  wifi: WifiConfigTab,
  switch: SwitchConfigTab
}

export const VenueEditContext = createContext({} as {
  isDirty: boolean,
  setIsDirty: (isDirty: boolean) => void
})

export function VenueEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [isDirty, setIsDirty] = useState(false)

  return (
    <VenueEditContext.Provider value={{ isDirty, setIsDirty }}>
      <VenueEditPageHeader />
      { Tab && <Tab /> }
    </VenueEditContext.Provider>
  )
}
