import { useParams } from '@acx-ui/react-router-dom'

import PageHeader  from './PageHeader'
import SwitchTable from './SwitchesTable'

type SwitchTab = 'list' | 'report'

export default function SwitchList () {

  const { activeTab } = useParams()

  const currentTab = (tab: SwitchTab) => {
    switch(tab) {
      case 'list':
        return <SwitchTable />
      case 'report':
        return <div>wired</div>
    }
  }

  return <>
    <PageHeader />
    {currentTab(activeTab as SwitchTab)}
  </>
}
