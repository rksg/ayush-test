import { Space } from 'antd'
import styled    from 'styled-components'

export const StyledWanLinkTargetWrapper = styled(Space)`
  width: 100%;
  justify-content: space-between;
  color: var(--acx-primary-white);

  & .ant-badge.ant-badge-status {
    display: flex;
    align-items: center;
    & .ant-badge-status-text {
      color: var(--acx-primary-white);
    }
  }
`