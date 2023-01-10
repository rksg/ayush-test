import styled from 'styled-components/macro'

import { ArrowChevronRight } from '@acx-ui/icons'
export const ArrowChevronRightIcons = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  path {
    stroke: var(--acx-accents-blue-50);
  }

  &:hover {
    path {
      stroke: var(--acx-accents-orange-50);
    }
  }
`