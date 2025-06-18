// import moment from 'moment-timezone

import { GridRow , GridCol } from '@acx-ui/components'

import { TrafficByRadio } from './Widgets/TrafficByRadio'

import type { Mdu360TabPros } from '.'


const ResidentExperienceTab: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {

  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '240px' }}>
        <TrafficByRadio filters={{ startDate, endDate }}/>
      </GridCol>
    </GridRow>
  )
}

export default ResidentExperienceTab