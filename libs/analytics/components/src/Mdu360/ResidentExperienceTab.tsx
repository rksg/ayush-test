import { GridRow , GridCol } from '@acx-ui/components'

import { TopApplications } from './Widgets/TopApplications'
import { WifiClient }      from './Widgets/WifiClient'

import type { Mdu360TabPros } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
        <WifiClient filters={{ startDate, endDate }} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
        <TopApplications filters={{ startDate, endDate }} />
      </GridCol>
    </GridRow>
  )
}

export default ResidentExperienceTab
