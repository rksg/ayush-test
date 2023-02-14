import styled from 'styled-components/macro'

import { GridCol, GridRow } from '@acx-ui/components'

export const SwitchStatusHeader = styled(GridCol)`
  height: 20px;
  padding-left: 15px;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`
export const Status = styled(GridCol)`
  height: 20px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  align-items: end;
`
export const Duration = styled('span')`
  height: 20px;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  display: contents;
`
export const Wrapper = styled(GridRow)`
  padding: 10px 0 0 0;
`
