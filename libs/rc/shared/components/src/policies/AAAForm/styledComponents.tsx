import { Space } from 'antd'
import styled    from 'styled-components'

import { InformationSolid } from '@acx-ui/icons'

export const InfoIcon = styled(InformationSolid)`
path {
  fill: var(--acx-neutrals-50);
  stroke: var(--acx-primary-white) !important;
}
`

export const StyledSpace = styled(Space)`
  width: 100%;
  margin-bottom: var(--acx-descriptions-space);
  justify-content: space-between;
  & .ant-form-item {
      margin: 0;
  }
`

export const FormItemWrapper = styled.div`
  & .ant-form-item-control {
      display: none;
  }
`

export const RacSecDiv = styled.div`
  margin-bottom: 20px;
`