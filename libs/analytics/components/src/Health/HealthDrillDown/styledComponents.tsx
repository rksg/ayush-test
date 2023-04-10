import styled from 'styled-components/macro'

import { GridRow } from '@acx-ui/components'

import { EnhancedStage } from './config'

export const Title = styled.div`
  font-size: 14px;
  font-weight: var(--acx-body-font-weight-bold);
`
export const ChartContainer = styled.div<{ height : number, padding : number }>`
  padding: ${props => props.padding}px 0;
  width: 100%;
  height: ${props => props.height + 'px'};
  display: flex;
  position: relative;
`

export const StageList = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`
export const Stage = styled.div<EnhancedStage>`
  flex: 1 1 ${props => props.width}px;
  background: ${props => props.bgColor};
  cursor: pointer;
  transition: all 0.2s;
  height: ${props => props.isSelected ? 'calc(100% + 10px) !important' : '100%'};
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;
  &:hover{
    height: calc(100% + 7px);
  }
`
export const Label = styled.div<{ pinPosition : string, line: number }>`
  position: absolute;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  font-weight: var(--acx-body-font-weight-bold);
  ${props => `
    padding-${props.pinPosition}: 10px;
  `}
  transition: all 0.3s;
  white-space: nowrap;
  ${props => props.line === 2 ? `
    padding-top: 15px;
    height: 60px;
  ` : ''}
`
export const Pin = styled.div<{ pinPosition : string, dir: string,color : string }>`
  position: absolute;
  ${props => props.pinPosition}: 0;
  top: ${props => props.dir ? 0 : '50%'};
  width: 5px;
  height: 50%;
  border-left: 1px solid ${props => props.color};

  &::after{
    position: absolute;
    left: -3px;
    top: ${props => props.dir ? 'calc(100% - 3px)' : '-3px'};
    content: ' ';
    width: 5px;
    height: 5px;
    border-radius: 2.5px;
    background: ${props => props.color};
  }
`

export const DrillDownRow = styled(GridRow)`
  margin-top: 25px;
  margin-left: 0px !important;
  margin-right: 0px !important;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid var(--acx-neutrals-20);
  box-shadow: 0px 2px 4px rgba(51, 51, 51, 0.08);
`

export const Point = styled.div.attrs((props: { $xPos: number | null }) => props)`
  background: var(--acx-primary-white);
  border: 0.5px solid rgba(173, 186, 193, 1);
  border-bottom-width: 0px;
  border-left-width: 0px;
  transform: rotate(-45deg);
  position: relative;
  top: -10px;
  width: 20px;
  height: 20px;
  ${props => props.$xPos ? `left: ${props.$xPos}px;` : 'left: 50%;' }
`

export const Separator = styled.div`
  border-top: 0.5px solid rgba(173, 186, 193, 1);
  margin: 10px 0px;
`

export const HealthPieChartWrapper = styled.div`
  margin-top: 5px;
  height: 100%;
  .ant-card-body {
    height: 100%
  }
`

export const PieChartTitle = styled.span`
  text-align: left;
  font-size: 12px;
`
