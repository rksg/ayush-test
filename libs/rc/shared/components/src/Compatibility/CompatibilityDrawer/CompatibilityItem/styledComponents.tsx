import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const StyledWrapper = styled(Space)`
  width: 100%;

  & > .ant-space-item:last-child > div {
    margin-bottom: 20px;
  }
`