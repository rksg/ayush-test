import moment from 'moment-timezone'

import { GridRow , GridCol } from '@acx-ui/components'

import type { Mdu360TabPros } from '.'

const ResidentExperienceTab: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {

  return (
    <GridRow>
      <GridCol col={{ span: 24 }} >
        {/* Please add widgets and remove this content */}
       startDate: {moment(startDate).format('YYYY-MM-DD HH:mm:ss')},
       endDate: {moment(endDate).format('YYYY-MM-DD HH:mm:ss')}
      </GridCol>
    </GridRow>

  )
}

export default ResidentExperienceTab