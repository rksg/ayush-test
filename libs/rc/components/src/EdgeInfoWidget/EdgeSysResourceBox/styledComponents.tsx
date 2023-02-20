import { Statistic as antStatistic } from 'antd'
import styled                        from 'styled-components/macro'

export const Statistic = styled(antStatistic)`
  display: flex;
  flex-direction: column;
  text-align: center;
  .ant-statistic-title {
    color: var(--acx-primary-black);
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
    font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  }
  .ant-statistic-content {
    color: var(--acx-primary-black);
    .ant-statistic-content-value {
      font-size: 32px;
      font-weight: var(--acx-body-font-weight-bold);
    }
    .ant-statistic-content-suffix {
      font-size: var(--acx-body-2-font-size);
    }
  }
`