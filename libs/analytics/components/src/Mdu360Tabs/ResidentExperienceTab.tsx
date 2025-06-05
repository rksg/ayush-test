import moment from 'moment-timezone'

import { GridRow , GridCol } from '@acx-ui/components'


import type { Mdu360TabsPros } from './types'

const ResidentExperienceTab: React.FC<Mdu360TabsPros> = ({ startDate, endDate }) => {

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} >
       Please add widgets:
       startDate:  {moment(startDate).format('YYYY-MM-DD')},
       endDate: {moment(endDate).format('YYYY-MM-DD')}
      </GridCol>
    </GridRow>

  )
}

export default ResidentExperienceTab