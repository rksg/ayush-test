//import { useParams } from '@acx-ui/react-router-dom'

//import { ApOverviewTab } from './ApOverviewTab'
import ApPageHeader     from './ApPageHeader'
import { ApReportsTab } from './ApReportsTab'

// const tabs = {
//   //overview: ApOverviewTab,
//   reports: ApReportsTab
// }

export default function ApDetails () {
  // const { activeTab } = useParams()
  // const Tab = tabs[activeTab as keyof typeof tabs]
  // return <ApContextProvider>
  //   <ApPageHeader />
  //   { Tab && <Tab /> }
  // </ApContextProvider>
  return <>
    <ApPageHeader />
    <ApReportsTab/>
    {/* { Tab && <Tab /> } */}


  </>
}
