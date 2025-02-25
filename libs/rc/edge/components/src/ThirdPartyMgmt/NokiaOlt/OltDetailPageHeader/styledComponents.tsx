import { Statistic as AntStatistic, Descriptions as AntdDescriptions } from 'antd'
import styled                                                          from 'styled-components/macro'

import { GridRow }   from '@acx-ui/components'
import { PoeUsage  } from '@acx-ui/icons'

import { EdgeNokiaOltStatus } from '../OltStatus'

export const StyledRow = styled(GridRow)`
  height: 150px;
  background-color: rgb(248, 248, 250);
  justify-content: space-around;
`

export const StyledEdgeNokiaOltStatus = styled(EdgeNokiaOltStatus)`
  &.ant-badge {
    display: flex;
  }
  .ant-badge-status-dot {
    width: 16px;
    height: 16px;
  }
  & .ant-badge-status-text {
    font-size: var(--acx-subtitle-1-font-size);
    font-weight: bold;
  }
`

export const PoeUsageIcon = styled(PoeUsage)`
  height: 42px;
  width: 42px;
`

export const StyledAntStatistic = styled(AntStatistic)`
  & {
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    align-items: center;
    margin: auto;

    .ant-statistic-title {
      color: var(--acx-primary-black);
      font-family: var(--acx-neutral-brand-font);
      font-size: var(--acx-subtitle-4-font-size);
      line-height: var(--acx-subtitle-4-line-height);
      font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
      white-space: normal;
    }
    .ant-statistic-content {
      .ant-statistic-content-value {
        font-size: 22px;
        font-weight: var(--acx-body-font-weight-bold);
      }
      .ant-statistic-content-value .ant-typography {
        color: inherit;
      }
      .ant-statistic-content-value .ant-typography.unit {
        font-size: 16px;
        font-weight: normal;
        margin-left: 3px;
      }
      .ant-statistic-content-suffix {
        font-size: var(--acx-body-2-font-size);
      }
    }
  }
`


export const StyledAntdDescriptions = styled(AntdDescriptions)`
  max-width: 550px;

  .ant-descriptions-row > td {
    padding-bottom: 5px;
  }
  .ant-descriptions-item-container .ant-descriptions-item-label,
  .ant-descriptions-item-container .ant-descriptions-item-content {
      font-size: 12px;
  }
  .ant-descriptions-item-container .ant-descriptions-item-label{
    font-weight: bold;
  }
`