import styled from 'styled-components/macro'

import { GridCol } from '@acx-ui/components'

export const CategoryContainer = styled.div`
  margin-bottom: 40px;
`

export const OltCardWrapper = styled(GridCol)`
& div.ant-card-body {
  cursor: not-allowed;

  & label.ant-radio-wrapper {
    pointer-events: none;
  }
  & span.ant-radio {
    display: none;
  }
}
`