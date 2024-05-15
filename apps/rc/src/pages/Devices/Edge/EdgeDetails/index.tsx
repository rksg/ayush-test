import { useParams }                                     from '@acx-ui/react-router-dom'
import { EdgeScopes, SwitchScopes, WifiScopes }          from '@acx-ui/types'
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
    content: EdgeOverview
  },
  troubleshooting: {
    content: EdgeTroubleshooting,
    scopeKey: [EdgeScopes.UPDATE]
  },
  services: {
    content: EdgeServices
  },
  dhcp: {
    content: EdgeDhcp
  },
  timeline: {
    content: EdgeTimeline
  }
} as {
  [key in string]: {
    content: () => JSX.Element
    scopeKey?: (WifiScopes|SwitchScopes|EdgeScopes)[],
  }
}

export default function EdgeDetails () {
  const { activeTab, serialNumber } = useParams()
  const tabConfig = tabs[activeTab as keyof typeof tabs]

  const Tab = tabConfig
    ? (!tabConfig.scopeKey || hasPermission({ scopes: tabConfig.scopeKey })
      ? tabConfig.content
      : goToNoPermission)
    : goToNotFound

  return <EdgeDetailsDataProvider serialNumber={serialNumber}>
    <EdgeDetailsPageHeader />
    { Tab && <Tab /> }
  </EdgeDetailsDataProvider>
}
