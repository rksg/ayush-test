import { Statistic as antStatistic } from 'antd'
import styled, { css }               from 'styled-components/macro'

import { CaretDoubleDownOutlined, CaretDoubleUpOutlined } from '@acx-ui/icons'

const colors = {
  successCount: {
    background: '--acx-semantics-green-50',
    text: '--acx-primary-white'
  },
  failureCount: {
    background: '--acx-semantics-red-50',
    text: '--acx-primary-white'
  },
  successPercentage: {
    background: '--acx-semantics-yellow-40',
    text: '--acx-primary-white'
  },
  averageTtc: {
    background: '--acx-neutrals-30',
    text: '--acx-primary-black'
  }
}

const arrowStyle = css`
  height: 16px;
  width: 16px;
  vertical-align: middle;
`

export const getBoxComponents = (type: string) => ({
  Wrapper: styled.div`
    padding-block: 10px 5px;
    writing-mode: horizontal-tb;
    background: var(${colors[type as keyof typeof colors].background});
    border-radius: 3px;
    text-align: center;
  `,
  Statistic: styled(antStatistic)`
    display: flex;
    flex-direction: column-reverse;
    .ant-statistic-title {
      color: var(${colors[type as keyof typeof colors].text});
      font-size: var(--acx-body-4-font-size);
    }
    .ant-statistic-content {
      color: var(${colors[type as keyof typeof colors].text});
      .ant-statistic-content-value {
        font-size: 36px;
        font-weight: var(--acx-body-font-weight-bold);
      }
      .ant-statistic-content-suffix {
        font-size: var(--acx-body-2-font-size);
      }
    }
  `,
  UpArrow: styled(CaretDoubleUpOutlined)`
    ${arrowStyle}
    path {
      stroke: var(${colors[type as keyof typeof colors].text});
    }`,
  DownArrow: styled(CaretDoubleDownOutlined)`
    ${arrowStyle}
    path {
      stroke: var(${colors[type as keyof typeof colors].text});
    }`
})
