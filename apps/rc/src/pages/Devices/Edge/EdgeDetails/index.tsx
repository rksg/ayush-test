import { useParams }                                     from '@acx-ui/react-router-dom'
import { EdgeScopes }                                    from '@acx-ui/types'
import { goToNoPermission, goToNotFound, hasPermission } from '@acx-ui/user'

import { EdgeDetailsDataProvider } from './EdgeDetailsDataProvider'
import { EdgeDetailsPageHeader }   from './EdgeDetailsPageHeader'
import { EdgeDhcp }                from './EdgeDhcp'
import { EdgeOverview }            from './EdgeOverview'
import { EdgeServices }            from './EdgeServices'
import { EdgeTimeline }            from './EdgeTimeline'
import { EdgeTroubleshooting }     from './EdgeTroubleshooting'

const tabs = {
  overview: {
    scopeKey: [EdgeScopes.READ],
    content: EdgeOverview
  },
  troubleshooting: {
    scopeKey: [EdgeScopes.UPDATE],
    content: EdgeTroubleshooting
  },
  services: {
    scopeKey: [EdgeScopes.READ],
    content: EdgeServices
  },
  dhcp: {
    scopeKey: [EdgeScopes.READ],
    content: EdgeDhcp
  },
  timeline: {
    scopeKey: [EdgeScopes.READ],
    content: EdgeTimeline
  }
}

export default function EdgeDetails () {
  const { activeTab, serialNumber } = useParams()
  const tabConfig = tabs[activeTab as keyof typeof tabs]

  const Tab = tabConfig
    ? hasPermission({ scopes: tabConfig.scopeKey }) ? tabConfig.content : goToNoPermission
    : goToNotFound

  return <EdgeDetailsDataProvider serialNumber={serialNumber}>
    <EdgeDetailsPageHeader />
    { Tab && <Tab /> }
  </EdgeDetailsDataProvider>
}
