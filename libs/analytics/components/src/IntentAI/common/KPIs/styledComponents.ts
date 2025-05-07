import { ComponentType } from 'react'

import { Statistic as AntStatistic, StatisticProps } from 'antd'
import styled                                        from 'styled-components'

export const Title = styled.div`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  font-weight: var(--acx-headline-5-font-weight-bold);
  margin-bottom: 10px;
`

export const Statistic = styled<ComponentType<StatisticProps>>(AntStatistic)`
  display: flex;
  flex-direction: column-reverse;
  .ant-statistic-title {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-5-font-size);
    line-height: var(--acx-body-5-line-height);
    margin-bottom: 0;
  }
  .ant-statistic-content {
    display: flex;
    align-items: center;
  }
  .ant-statistic-content-value {
    // body typography does not have large enough size
    font-size: 26px;
    line-height: 1.3em;
    font-weight: var(--acx-body-font-weight-bold);
  }
  .ant-statistic-content-suffix {
    display: flex;
  }
  .ant-statistic-content-suffix-unit {
    font-size: var(--acx-body-3-font-size);
    line-height: var(--acx-body-3-line-height);
    font-weight: var(--acx-body-font-weight);
  }

  .ant-statistic-content-suffix-conj {
    font-size: var(--acx-body-3-font-size);
    line-height: var(--acx-body-3-line-height);
    font-weight: var(--acx-headline-2-font-weight-bold);
    margin-left: 6px;
    
  }

  .ant-statistic-content-suffix-previous {
    font-size: var(--acx-body-2-font-size);
    line-height: var(--acx-body-3-line-height);
    font-weight: var(--acx-subtitle-3-font-weight);
  }
`
