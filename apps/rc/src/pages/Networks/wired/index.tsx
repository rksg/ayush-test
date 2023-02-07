import { useParams } from '@acx-ui/react-router-dom'

import { CliTab }      from './cli'
import { ProfilesTab } from './profiles'
import WiredPageHeader from './WiredPageHeader'


const tabs = {
  profiles: ProfilesTab,
  cli: CliTab
}

export default function Wired () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <WiredPageHeader />
    { Tab && <Tab /> }
  </>
}
