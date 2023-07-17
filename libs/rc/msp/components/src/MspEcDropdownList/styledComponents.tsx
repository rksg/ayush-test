import styled from 'styled-components/macro'

import { LayoutUI } from '@acx-ui/components'

export const CompanyNameDropdown = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: var(--acx-header-company-name-right-space);

  ${LayoutUI.CompanyName} {
    max-width: calc(
      var(--acx-header-company-name-width) -
      var(--acx-header-caret-width)
    );
  }
`
