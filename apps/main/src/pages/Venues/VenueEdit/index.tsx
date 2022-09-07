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

export function VenueEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]

  return (
    <>
      <VenueEditPageHeader />
      { Tab && <Tab /> }
    </>
  )
}
