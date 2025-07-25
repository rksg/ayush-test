import * as UI                   from './styledComponents'
import { ApplicationCategories } from './Widgets/ApplicationCategories'
import ClientExperience          from './Widgets/ClientExperience'
import { TopApplications }       from './Widgets/TopApplications'
import { TrafficByRadio }        from './Widgets/TrafficByRadio'
import { WifiClient }            from './Widgets/WifiClient'
import { WifiGeneration }        from './Widgets/WifiGeneration'

import type { Mdu360TabProps } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabProps> = ({ startDate, endDate }) => {
  return (
    <UI.ResidentExperienceGrid>
      <UI.FullWidthGridItem>
        <ClientExperience filters={{ startDate, endDate }} />
      </UI.FullWidthGridItem>
      <WifiClient filters={{ startDate, endDate }} />
      <WifiGeneration startDate={startDate} endDate={endDate} />
      <TopApplications filters={{ startDate, endDate }} />
      <ApplicationCategories filters={{ startDate, endDate }} />
      <TrafficByRadio filters={{ startDate, endDate }}/>
    </UI.ResidentExperienceGrid>
  )
}

export default ResidentExperienceTab
