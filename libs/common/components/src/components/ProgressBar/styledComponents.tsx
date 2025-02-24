import { forwardRef } from 'react'

import { Progress as AntProgress } from 'antd'
import styled                      from 'styled-components/macro'

import type { ProgressProps as AntProgressProps } from 'antd/lib/progress'

export interface ProgressBarProps extends Pick<AntProgressProps,
  'percent' | 'strokeWidth' | 'style'> {
  percent: number // 0 - 100
  gradientMode?: 'completion' | 'usage'
}

export type ProgressProps = AntProgressProps & {
  gradientmode?: 'completion' | 'usage'
}

const ProgressNoRef = styled(AntProgress)<{ gradientmode?: string }>`
    .ant-progress-steps-outer {
      .ant-progress-steps-item {
        width: 6px !important;
        border-radius: 2px;
      }
    }
    .ant-progress-inner, .ant-progress-bg {
      border-radius: ${(props) => props.gradientmode === 'usage' ?
    '2px 2px 2px 2px' : '0px 3px 3px 0px'} !important;
    }
`

export const Progress = forwardRef<HTMLDivElement, ProgressProps>((props, ref) =>
  <div ref={ref} className='ant-progress-wrapper'><ProgressNoRef {...props} /></div>)
