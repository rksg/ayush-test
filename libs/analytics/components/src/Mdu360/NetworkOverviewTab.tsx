import * as UI             from './styledComponents'
import { IntentAISummary } from './Widgets/IntentAISummary'

import type { Mdu360TabProps } from '.'

const NetworkOverviewTab: React.FC<Mdu360TabProps> = () => {
  return (
    <UI.Grid>
      <IntentAISummary/>
    </UI.Grid>
  )
}

export default NetworkOverviewTab
