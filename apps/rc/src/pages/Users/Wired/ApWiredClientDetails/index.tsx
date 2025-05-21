import { useParams } from 'react-router-dom'

import { goToNotFound } from '@acx-ui/user'

import { ApWiredClientContextProvider } from './ApWiredClientContextProvider'
import ApWiredClientDetailPageHeader    from './ApWiredClientDetailPageHeader'
import ApWiredClientEventTab            from './ApWiredClientEventTab'
import ApWiredClientOverviewTab         from './ApWiredClientOverviewTab'


const tabs = {
  overview: ApWiredClientOverviewTab,
  event: ApWiredClientEventTab
}

const ApWiredClientDetails = () => {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound

  return <ApWiredClientContextProvider>
    <ApWiredClientDetailPageHeader />
    { Tab && <Tab /> }
  </ApWiredClientContextProvider>
}

export default ApWiredClientDetails