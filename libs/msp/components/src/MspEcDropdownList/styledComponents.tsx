import styled from 'styled-components/macro'

import { LayoutUI } from '@acx-ui/components'

export const CompanyNameDropdown = styled(LayoutUI.CompanyName)`
  cursor: pointer;
  display: flex;

  ${LayoutUI.Icon} {
    margin-left: 7px;
    svg {
      width: 8px;
      height: 100%;
      vertical-align: baseline;
      path {
        stroke: var(--acx-primary-white);
        fill: var(--acx-primary-white);
      }
    }
  }
`
