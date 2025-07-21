import * as UI                   from './styledComponents'
import { ApplicationCategories } from './Widgets/ApplicationCategories'
import ClientExperience          from './Widgets/ClientExperience'
import SLA                       from './Widgets/SLA'
import { TopApplications }       from './Widgets/TopApplications'
import { TrafficByRadio }        from './Widgets/TrafficByRadio'
import { WifiClient }            from './Widgets/WifiClient'
import { WifiGeneration }        from './Widgets/WifiGeneration'
import { useSlaThresholdsQuery } from './services'
import type { Mdu360TabProps }   from '.'


const ResidentExperienceTab: React.FC<Mdu360TabProps> = ({ startDate, endDate }) => {
  const mspEcIds: string[] = []
  const slaQueryResults = useSlaThresholdsQuery({ mspEcIds })

  return (
    <UI.Grid>
      <UI.FullWidthGridItem>
        <ClientExperience
          filters={{ startDate, endDate }}
          slaQueryResults={slaQueryResults}
        />
      </UI.FullWidthGridItem>
      <WifiClient filters={{ startDate, endDate }} />
      <WifiGeneration startDate={startDate} endDate={endDate} />
      <TopApplications filters={{ startDate, endDate }} />
      <ApplicationCategories filters={{ startDate, endDate }} />
      <TrafficByRadio filters={{ startDate, endDate }} />
      <SLA mspEcIds={mspEcIds} queryResults={slaQueryResults} />
    </UI.Grid>
  )
}

export default ResidentExperienceTab
