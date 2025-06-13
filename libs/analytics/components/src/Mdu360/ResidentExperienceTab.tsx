
import { GridRow , GridCol } from '@acx-ui/components'

import { WifiClient }           from './widgets/WifiClient'
import { WifiClientCapability } from './widgets/WifiClientCapability'

import type { Mdu360TabPros } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} >
        <GridRow>
          <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
            <WifiClientCapability startDate={startDate} endDate={endDate} />
          </GridCol>
        </GridRow>
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
        <WifiClient filters={{ startDate, endDate }} />
      </GridCol>
    </GridRow>
  )
}

export default ResidentExperienceTab