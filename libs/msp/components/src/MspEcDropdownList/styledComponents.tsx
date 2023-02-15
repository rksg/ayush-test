import styled from 'styled-components/macro'

import { LayoutUI } from '@acx-ui/components'

export const CompanyNameDropdown = styled.div`
  --acx-header-company-name-caret-width: 8px;

  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: var(--acx-header-company-name-right-space);

  ${LayoutUI.CompanyName} {
    max-width: calc(
      var(--acx-header-company-name-width) -
      var(--acx-header-company-name-caret-width)
    );
  }

  ${LayoutUI.Icon} {
    svg {
      width: var(--acx-header-company-name-caret-width);
      height: 100%;
      vertical-align: baseline;
      path {
        stroke: var(--acx-primary-white);
        fill: var(--acx-primary-white);
      }
    }
  }
`
