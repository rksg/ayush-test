import { Space } from 'antd'
import styled    from 'styled-components'

import { InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'

export const InfoIcon = styled(InformationSolid)`
path {
  fill: var(--acx-neutrals-50);
  stroke: var(--acx-primary-white) !important;
}
`

export const QuestionIcon = styled(QuestionMarkCircleOutlined)`
  width: 16px;
  height: 16px;
  display: block;
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