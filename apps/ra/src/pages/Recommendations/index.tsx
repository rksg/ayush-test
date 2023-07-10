import { get } from 'lodash'

import { AIAnalytics, AIAnalyticsTabEnum } from '@acx-ui/analytics/components'
import { useParams }                       from '@acx-ui/react-router-dom'

const Recommendations = () => {
  const params = useParams()
  const activeTab = get(params, 'activeTab', 'crrm')
  const selectedTab = activeTab === 'crrm'
    ? AIAnalyticsTabEnum.CRRM
    : AIAnalyticsTabEnum.AIOPS
  return <AIAnalytics tab={selectedTab}/>
}

export default Recommendations
