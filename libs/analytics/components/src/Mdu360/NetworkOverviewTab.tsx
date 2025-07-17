import * as UI             from './styledComponents'
import { IntentAISummary } from './Widgets/IntentAISummary'

import type { Mdu360TabProps } from '.'

const NetworkOverviewTab: React.FC<Mdu360TabProps> = ({ startDate, endDate }) => {
  return (
    <UI.Grid>
      <IntentAISummary filters={{ startDate, endDate }}/>
    </UI.Grid>
  )
}

export default NetworkOverviewTab
