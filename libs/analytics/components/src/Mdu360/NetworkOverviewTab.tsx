import * as UI             from './styledComponents'
import { IntentAISummary } from './Widgets/IntentAISummary'

import type { Mdu360TabProps } from '.'

const NetworkOverviewTab: React.FC<Mdu360TabProps> = () => {
  return (
    <UI.NetworkOverviewGrid>
      <IntentAISummary/>
    </UI.NetworkOverviewGrid>
  )
}

export default NetworkOverviewTab
