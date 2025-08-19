import { Olt, OltMockdata } from '@acx-ui/olt/utils'
import { useParams }        from '@acx-ui/react-router-dom'
import { goToNotFound }     from '@acx-ui/user'

import { OltConfigurationTab } from './OltConfigurationTab'
import { OltDetailPageHeader } from './OltDetailPageHeader'
import { OltDetailsContext }   from './OltDetailsContext'
import { OltOntTab }           from './OltOntTab'
import { OltOverviewTab }      from './OltOverviewTab'

const { oltData } = OltMockdata

export const OltDetails = () => {
  const { activeTab } = useParams()

  const oltDetails = oltData as Olt //TODO: temp, remove when api is ready

  const tabs = {
    overview: OltOverviewTab,
    onts: OltOntTab,
    configuration: OltConfigurationTab
  }
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound

  return <OltDetailsContext.Provider value={{
    oltDetailsContextData: oltDetails
  }}>
    <OltDetailPageHeader
      oltDetails={oltDetails}
    />
    { Tab && <Tab /> }
  </OltDetailsContext.Provider>
}
