import { useParams }                                     from '@acx-ui/react-router-dom'
import { ScopeKeys }                                     from '@acx-ui/types'
import { goToNoPermission, goToNotFound, hasPermission } from '@acx-ui/user'

import { EdgeClusterOverview }            from './ClusterOverview'
import { EdgeClusterDetailsDataProvider } from './EdgeClusterDetailsDataProvider'
import { EdgeClusterDetailsPageHeader }   from './PageHeader'
// import { EdgeServices }                   from './EdgeServices'

const tabs = {
  overview: {
    content: EdgeClusterOverview
  // },
  // services: {
  //   content: EdgeServices
  }
} as {
  [key in string]: {
    content: () => JSX.Element
    scopeKey?: ScopeKeys,
  }
}

export default function EdgeClusterDetails () {
  const { activeTab, clusterId } = useParams()
  const tabConfig = tabs[activeTab as keyof typeof tabs]

  const Tab = tabConfig
    ? (!tabConfig.scopeKey || hasPermission({ scopes: tabConfig.scopeKey })
      ? tabConfig.content
      : goToNoPermission)
    : goToNotFound

  return <EdgeClusterDetailsDataProvider clusterId={clusterId}>
    <EdgeClusterDetailsPageHeader />
    { Tab && <Tab /> }
  </EdgeClusterDetailsDataProvider>
}
