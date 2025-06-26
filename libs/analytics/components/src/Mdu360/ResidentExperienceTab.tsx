import * as UI                   from './styledComponents'
import { ApplicationCategories } from './Widgets/ApplicationCategories'
import { WifiClient }            from './Widgets/WifiClient'
import { WifiGeneration }        from './Widgets/WifiGeneration'

import type { Mdu360TabProps } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabProps> = ({ startDate, endDate }) => {
  return (
    <UI.Grid>
      <WifiClient filters={{ startDate, endDate }} />
      <WifiGeneration startDate={startDate} endDate={endDate} />
      <ApplicationCategories filters={{ startDate, endDate }} />
    </UI.Grid>
  )
}

export default ResidentExperienceTab
