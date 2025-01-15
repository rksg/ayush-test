import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const StyledSpace = styled(Space)`
  & > .ant-space-item:not(:last-child) {
    margin-bottom: -15px;
  }
`