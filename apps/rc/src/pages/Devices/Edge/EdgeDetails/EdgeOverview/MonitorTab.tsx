import { GridCol, GridRow } from '@acx-ui/components'
import {
  EdgePortsByTrafficWidget,
  EdgeResourceUtilizationWidget,
  EdgeTrafficByVolumeWidget,
  EdgeUpTimeWidget
} from '@acx-ui/rc/components'

export const MonitorTab = () => {
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} className='statistic upTimeWidget'>
        <EdgeUpTimeWidget />
      </GridCol>
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeTrafficByVolumeWidget />
      </GridCol>
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgeResourceUtilizationWidget />
      </GridCol>
      <GridCol col={{ span: 12 }} className='statistic'>
        <EdgePortsByTrafficWidget />
      </GridCol>
    </GridRow>
  )
}