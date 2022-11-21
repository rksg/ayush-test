import { useParams } from '@acx-ui/react-router-dom'

import { MacRegistrationListOverviewTab } from './MacRegistrationListOverviewTab'
import MacRegistrationListPageHeader      from './MacRegistrationListPageHeader'
import { MacRegistrationsTab }            from './MacRegistrationsTab'

const tabs = {
  overview: MacRegistrationListOverviewTab,
  mac_registrations: MacRegistrationsTab
}

export default function MacRegistrationListDetails () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <MacRegistrationListPageHeader />
    { Tab && <Tab /> }
  </>
}
