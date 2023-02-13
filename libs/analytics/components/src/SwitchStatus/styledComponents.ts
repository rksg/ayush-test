import styled from 'styled-components/macro'

import { GridCol } from '@acx-ui/components'


export const SwitchStatusHeader = styled(GridCol)`
  height: 20px;
  padding-left: 15px; 
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`
export const TotalUptime = styled(GridCol)`
  height: 20px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: inline;
`
export const TotalDowntime = styled(GridCol)`
  height: 20px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  display: inline;
`
export const Duration = styled('span')`
  height: 20px;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
`