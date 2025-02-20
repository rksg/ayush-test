import styled from 'styled-components/macro'

import { GridCol } from '@acx-ui/components'

export const CategoryContainer = styled.div`
  margin-bottom: 40px;
`

export const OltCardWrapper = styled(GridCol)`
 & button.ant-btn.ant-btn-primary {
  display: none;
 }
`