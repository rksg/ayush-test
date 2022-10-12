import { Progress as AntProgress } from 'antd'
import styled                      from 'styled-components/macro'

export const Progress = styled(AntProgress)`
  .ant-progress-steps-outer {
    .ant-progress-steps-item {
      width: 9.18px !important;
      height: 8px !important;
    }

    div:first-child {
      border-radius: 1px 0px 0px 1px;
    }
    div:nth-child(5) {
      border-radius: 0px 1px 1px 0px;
    }
  }
`
