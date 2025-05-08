import { Space } from 'antd'
import styled    from 'styled-components'

export const StyledWanLinkTargetWrapper = styled(Space)`
  color: var(--acx-primary-white);
  & .ant-badge.ant-badge-status {
    display: flex;
    align-items: center;
    & .ant-badge-status-text {
      color: var(--acx-primary-white);
    }
  }
`