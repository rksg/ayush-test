import { useParams }    from '@acx-ui/react-router-dom'
import { goToNotFound } from '@acx-ui/user'

import { EdgeClusterOverview }            from './ClusterOverview'
import { EdgeClusterDetailsDataProvider } from './EdgeClusterDetailsDataProvider'
import { EdgeClusterDetailsPageHeader }   from './PageHeader'

const tabs = {
  overview: {
    content: EdgeClusterOverview
  }
} as {
  [key in string]: {
    content: () => JSX.Element
  }
}

export default function EdgeClusterDetails () {
  const { activeTab, clusterId } = useParams()
  const tabConfig = tabs[activeTab as keyof typeof tabs]

  const Tab = tabConfig.content || goToNotFound

  return <EdgeClusterDetailsDataProvider clusterId={clusterId}>
    <EdgeClusterDetailsPageHeader />
    { Tab && <Tab /> }
  </EdgeClusterDetailsDataProvider>
}
