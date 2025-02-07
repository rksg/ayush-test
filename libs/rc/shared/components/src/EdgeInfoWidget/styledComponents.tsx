import styled, { css } from 'styled-components/macro'

import { GridCol } from '@acx-ui/components'

export const Styles = css`
background-color: var(--acx-neutrals-10);

& > .ant-col {
  height: 176px;

  & .moreBtn {
    justify-content: center;
  }
}`

export const CentralizedChartGridCol = styled(GridCol)` 

`

// margin: auto;
// align-items: center;