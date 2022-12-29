import { useParams } from '@acx-ui/react-router-dom'

import { EdgeDetailsPageHeader } from './EdgeDetailsPageHeader'
import { EdgeOverview }          from './EdgeOverview'
import { EdgeServices }          from './EdgeServices'
import { EdgeTimeline }          from './EdgeTimeline'
import { EdgeTroubleshooting }   from './EdgeTroubleshooting'

const tabs = {
  overview: EdgeOverview,
  troubleshooting: EdgeTroubleshooting,
  services: EdgeServices,
  timeline: EdgeTimeline
}

export default function EdgeDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]

  return <>
    <EdgeDetailsPageHeader />
    { Tab && <Tab /> }
  </>
}
