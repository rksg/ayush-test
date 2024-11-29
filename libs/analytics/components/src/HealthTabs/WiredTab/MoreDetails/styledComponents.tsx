import styled from 'styled-components/macro'

import { GridRow } from '@acx-ui/components'

export const DrawerTitle = styled.span`
  margin-top: 5px;
`
export const ChartTitle = styled.span`
  font-size: 12px;
  padding-bottom: 10px;
`
export const PieChartTitle = styled.div`
  text-align: left;
  font-size: 12px;
  padding-bottom: 10px;
`
export const HealthPieChartWrapper = styled.div`
  .ant-card-body {
    height: 100%
  }
`
export const WrapperRow = styled(GridRow)`
  margin-left: 0px !important;
  margin-right: 0px !important;
  padding: 0px 0px;
`
export const NoDataWrapper = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
