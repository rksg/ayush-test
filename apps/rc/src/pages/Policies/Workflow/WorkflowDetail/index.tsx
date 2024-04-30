import { useParams } from '@acx-ui/react-router-dom'

import { WorkflowDetailOverviewTab }   from './WorkflowDetailOverviewTab'
import WorkflowDetailVersionHistoryTab from './WorkflowDetailVersionHistoryTab'
import WorkflowPageHeader              from './WorkflowPageHeader'


const tabs = {
  overview: WorkflowDetailOverviewTab,
  versionHistory: WorkflowDetailVersionHistoryTab
}

export default function WorkflowDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <WorkflowPageHeader />
    { Tab && <Tab /> }
  </>
}