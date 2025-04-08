import styled from 'styled-components'

import { Carousel as CommonCarousel } from '@acx-ui/components'

export const Carousel = styled(CommonCarousel)`
  ol {
    padding: 0;
    li {
      list-style-type: none;
      font-size: var(--acx-body-3-font-size);
      line-height: var(--acx-body-3-line-height);
    }
  }
`
