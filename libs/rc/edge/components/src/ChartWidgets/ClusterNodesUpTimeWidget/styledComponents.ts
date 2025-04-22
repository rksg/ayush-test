import { Col, Space } from 'antd'
import styled         from 'styled-components/macro'

import { GridCol, GridRow, HistoricalCard } from '@acx-ui/components'

export const HistoricalIcon = styled(HistoricalCard.Icon)`
  margin: 0px 0px -4px 4px;
`
export const EdgeStatusHeader = styled(GridCol)`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-headline-4-font-weight-bold);
`
export const Status = styled(GridCol)`
  height: 20px;
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  align-items: end;
`
export const Duration = styled.span`
  height: 20px;
  font-weight: var(--acx-body-4-font-weight);
  font-weight: var(--acx-body-font-weight-bold);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  display: contents;
`
export const Wrapper = styled(GridRow)`
  padding: 10px 0 0 0;
`

export const ChartWrapper = styled.div`
  .ant-tooltip {
    z-index: 1050 !important;
  }

  & .antd-multi-bar-time-series-chart {
    position: relative;
    
    &:hover {
      z-index: 10;
    }
  }
`

export const NodeListWrapper = styled(Col)`
  & {
    min-width: 100px;
    padding-right: 0 !important;
  }
`

export const StyledSpace = styled(Space)`
  height: 100%;
  width: 100%;
  padding-top: 5px;
  padding-bottom: 20px;
  text-align: right;
`