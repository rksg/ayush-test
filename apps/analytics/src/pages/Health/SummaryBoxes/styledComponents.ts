import { Statistic as antStatistic } from 'antd'
import styled, { css }               from 'styled-components/macro'

import { CaretDoubleDownOutlined, CaretDoubleUpOutlined } from '@acx-ui/icons'

type Type = keyof typeof colors

const colors = {
  successCount: {
    background: '--acx-semantics-green-50',
    activeBackground: '--acx-semantics-green-60',
    text: '--acx-primary-white'
  },
  failureCount: {
    background: '--acx-semantics-red-50',
    activeBackground: '--acx-semantics-red-60',
    text: '--acx-primary-white'
  },
  successPercentage: {
    background: '--acx-semantics-yellow-40',
    activeBackground: '--acx-semantics-yellow-50',
    text: '--acx-primary-white'
  },
  averageTtc: {
    background: '--acx-neutrals-30',
    activeBackground: '--acx-neutrals-40',
    text: '--acx-primary-black'
  }
} as const

const arrowStyle = css`
  height: 16px;
  width: 16px;
  vertical-align: middle;
`

export const Wrapper = styled.button.attrs({ type: 'button' })<{ $type: string }>`
  border: 0;
  cursor: pointer;
  padding-block: 10px;
  background: var(${props => colors[props.$type as Type].background});
  border-radius: 3px;
  text-align: center;
  &:focus, &:hover {
    outline: 0;
    background: var(${props => colors[props.$type as Type].activeBackground});
  }
`

export const Statistic = styled(antStatistic)<{ $type: string }>`
  display: flex;
  flex-direction: column-reverse;
  .ant-statistic-title {
    color: var(${props => colors[props.$type as Type].text});
    font-size: var(--acx-body-4-font-size);
  }
  .ant-statistic-content {
    color: var(${props => colors[props.$type as Type].text});
    .ant-statistic-content-value {
      font-size: 36px;
      font-weight: var(--acx-body-font-weight-bold);
    }
    .ant-statistic-content-suffix {
      font-size: var(--acx-body-2-font-size);
    }
  }
`

export const UpArrow = styled(CaretDoubleUpOutlined)<{ $type: string }>`
  ${arrowStyle}
  path {
    stroke: var(${props => colors[props.$type as Type].text});
  }
`

export const DownArrow = styled(CaretDoubleDownOutlined)<{ $type: string }>`
  ${arrowStyle}
  path {
    stroke: var(${props => colors[props.$type as Type].text});
  }
`
