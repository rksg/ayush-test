import moment from 'moment-timezone'

import { GridRow , GridCol } from '@acx-ui/components'

import { WifiClient } from './Widgets/WifiClient'

import type { Mdu360TabPros } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} >
        {/* Please add widgets and remove this content */}
       startDate: {moment(startDate).format('YYYY-MM-DD HH:mm:ss')},
       endDate: {moment(endDate).format('YYYY-MM-DD HH:mm:ss')}
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
        <WifiClient filters={{ startDate, endDate }} />
      </GridCol>
    </GridRow>
  )
}

export default ResidentExperienceTab