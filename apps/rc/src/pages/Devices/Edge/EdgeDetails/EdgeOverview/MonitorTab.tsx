import styled from 'styled-components'

import { GridCol, GridRow } from '@acx-ui/components'
import {
  EdgePortsByTrafficWidget,
  EdgeResourceUtilizationWidget,
  EdgeTrafficByVolumeWidget,
  EdgeUpTimeWidget
} from '@acx-ui/rc/components'

import { wrapperStyle } from './styledComponents'

export const MonitorTab = styled(({ className }: { className?: string }) => {
  return (
    <GridRow className={className}>
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
})`${wrapperStyle}`