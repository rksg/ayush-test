
import { GridRow , GridCol } from '@acx-ui/components'

import { WifiClient }     from './widgets/WifiClient'
import { WifiGeneration } from './widgets/WifiGeneration'

import type { Mdu360TabPros } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
        <WifiClient filters={{ startDate, endDate }} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '240px', paddingTop: '14px' }}>
        <WifiGeneration startDate={startDate} endDate={endDate} />
      </GridCol>
    </GridRow>
  )
}

export default ResidentExperienceTab
