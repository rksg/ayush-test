import { useParams } from '@acx-ui/react-router-dom'

import { OnDemandCliTab } from './onDemandCli'
import { ProfilesTab }    from './profiles'
import WiredPageHeader    from './WiredPageHeader'


const tabs = {
  profiles: ProfilesTab,
  onDemandCli: OnDemandCliTab
}

export default function Wired () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <WiredPageHeader />
    { Tab && <Tab /> }
  </>
}
