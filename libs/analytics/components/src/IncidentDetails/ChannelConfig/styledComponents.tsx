import styled from 'styled-components/macro'

import { GridCol as GridColComponent } from '@acx-ui/components'

export const Title = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height)
  color: var(--acx-neutrals-70);
  margin-bottom: 6px;
`
export const GridCol = styled(GridColComponent)`
  text-align: center;
`
