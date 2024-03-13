import { Badge as AntBadge } from 'antd'
import styled                from 'styled-components/macro'

export const Badge = styled(AntBadge)`
  justify-content: center;
  .ant-badge-status-dot {
    width: 12px;
    height: 12px;
  }
`

export const Errors = styled.ul`
  padding-left: 15px;
  margin-bottom: 0;
`
