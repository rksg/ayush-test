import styled from 'styled-components/macro'

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
export const TableHeading = styled.span`
  padding-bottom : 10px;
  font-size: 12px;
`
