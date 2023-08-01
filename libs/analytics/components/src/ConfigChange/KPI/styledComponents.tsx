import { Statistic as AntStatistic } from 'antd'
import styled                        from 'styled-components/macro'

import { TrendPill as Pill } from '@acx-ui/components'

export const TrendPill = styled(Pill)`
  min-width: 40px;
  text-align: center;
`

export const TransparentTrend = styled.div`
  display: inline-block;
  height: 16px;
  min-width: 40px;
  margin: 3px;
  color: var(--acx-primary-black);
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-6-font-size);
  line-height: var(--acx-subtitle-6-line-height);
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  text-align: center;
`

export const Statistic = styled(AntStatistic)`
  background-color: var(--acx-neutrals-10);
  padding: 4px 10px;
  margin-bottom: 3px;
  border-radius: 4px;
  position: relative;
  cursor: pointer;

  &.statistic-selected {
    background-color: var(--acx-neutrals-80);
    .ant-statistic-title { color: var(--acx-primary-white); }
    .ant-statistic-content { color: var(--acx-primary-white); }
  }

  .ant-statistic-title {
    font-weight: var(--acx-subtitle-4-font-weight);
    font-size: var(--acx-subtitle-4-font-size);
    line-height: var(--acx-subtitle-4-line-height);
    color: var(--acx-primary-black);
    margin: 0px;
  }
  .ant-statistic-content {
    color: var(--acx-primary-black);
    font-size: var(--acx-body-5-font-size);
    line-height: var(--acx-body-5-line-height);
    &-suffix {
      position: absolute;
      right: 30px;
      top: var(--acx-subtitle-4-font-size);
    }
  }
}
`

export const DropDownWrapper = styled.div` padding-bottom: 15px; `
