import { Progress } from 'antd'
import styled       from 'styled-components/macro'

export const ProgressBar = styled(Progress)`
  width: 120px;
  color: var(--acx-primary-white);
  cursor: pointer;
  .ant-progress-inner {
    border-radius: 4px !important
  }
  .ant-progress-bg {
    border-radius: 4px !important
  }
`