import { forwardRef } from 'react'

import { Progress as AntProgress } from 'antd'
import styled                      from 'styled-components/macro'

import type { ProgressProps } from 'antd/lib/progress'

const ProgressNoRef = styled(AntProgress)`
  .ant-progress-steps-outer {
    .ant-progress-steps-item {
      width: 6px !important;
      border-radius: 2px;
    }
  }
  .ant-progress-inner, .ant-progress-bg {
    border-radius: 0px 3px 3px 0px !important;
  }
`
export const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) =>
  <div ref={ref} className='ant-progress-wrapper'><ProgressNoRef {...props} /></div>)
