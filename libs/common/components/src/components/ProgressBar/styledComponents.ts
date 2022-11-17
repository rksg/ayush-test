import { Progress as AntProgress } from 'antd'
import styled                      from 'styled-components/macro'

export const Progress = styled(AntProgress)`
  .ant-progress-steps-outer {
    .ant-progress-steps-item {
      width: 6px !important;
      border-radius: 2px;
    }
  }
`
