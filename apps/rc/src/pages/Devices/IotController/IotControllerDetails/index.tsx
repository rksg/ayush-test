import { useParams }    from '@acx-ui/react-router-dom'
import { goToNotFound } from '@acx-ui/user'

import { IotControllerOverviewTab } from './IotControllerOverviewTab'
import IotControllerPageHeader      from './IotControllerPageHeader'

const tabs = {
  overview: IotControllerOverviewTab
}

export function IotControllerDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound
  return <>
    <IotControllerPageHeader />
    { Tab && <Tab /> }
  </>
}
