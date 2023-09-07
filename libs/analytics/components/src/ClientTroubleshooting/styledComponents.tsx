import { ElementType } from 'react'

import { Spin }        from 'antd'
import styled, { css } from 'styled-components/macro'

import {  PlusSquareOutlined, MinusSquareOutlined, DownloadOutlined } from '@acx-ui/icons'

const eventIconStyle = css`
  display: flex;
  margin-top: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`
export const History = styled.div`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-25);
  flex:1;
`
export const HistoryHeader = styled.div`
  padding: 12px 0 12px 16px;
  display : flex
`
export const HistoryContent = styled.div`
  .ant-list-item {
    border-bottom: none;
    padding: 0 0 8px 0;
    pointer-events: auto;
  }
  padding: 0 16px 0px 16px;
  .ant-list-item-meta-title {
    color: var(--acx-neutrals-70);
    font-size: var(--acx-subtitle-6-font-size);
  }
  .ant-list-item-meta-description {
    color: var(--acx-neutrals-100);
    font-size: var(--acx-subtitle-6-font-size);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ant-list-item-meta-avatar {
    margin-right: 5px;
  }
  overflow: auto;
  .ant-list-item-meta {
    pointer-events: auto;
  }
`
export const HistoryContentTitle = styled.span`
  font-weight: 600;
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  color: var(--acx-primary-black);
`
export const HistoryIcon = styled.span`
  margin-left : auto;
  margin-right: 16px;
  cursor: pointer;
`
export const EventTypeIcon = styled.span`
  ${eventIconStyle}
  background-color: var(${props => props.color});
`
export const IncidentEvent = styled.span`
  display: inline-block;
  border-radius: 8px;
  background-color: var(${props => props.color});
  font-size: 8px;
  height: 12px;
  width: 16px;
  color: var(--acx-primary-white);
  font-weight: var(--acx-body-font-weight-bold);
  margin: 1px 0 0 -8px;
  text-align: center;
  vertical-align: top;
  line-height: 12px;
`
export const StyledPlusSquareOutlined = styled(PlusSquareOutlined)`
   width: 16px;
   path{
      stroke:var(--acx-accents-blue-50);
    }`

export const StyledMinusSquareOutlined = styled(MinusSquareOutlined)`
   width: 16px;
   path{
      stroke:var(--acx-accents-blue-50);
    }`

export const StyledDisabledPlusSquareOutline = styled(PlusSquareOutlined)`
    width: 16px;
    path {
      stroke:var(--acx-neutrals-50);
    }
`

export const TimelineTitle = styled.span`
   line-height: 24px;
   font-weight: var(--acx-body-font-weight-bold);
   font-size: 12px;`
export const TimelineCount = styled.span`
   font-weight: var(--acx-body-font-weight-bold);
   font-size: 12px;`

export const TimelineSubContent = styled.span`
   line-height: 16px;
   font-weight: var(--acx-body-font-weight);
   white-space: nowrap;
   font-size: 12px;
   color: var(--acx-neutrals-70);`

export const RoamingTimelineSubContent = styled.span`
  line-height: 16px;
  font-weight: var(--acx-body-font-weight);
  white-space: nowrap;
  font-size: 10px;
  color: var(--acx-neutrals-70);
  text-decoration: underline dotted;
`

export const TooltipWrapper = styled.div`
    color: var(--acx-neutrals-70);
    font-weight: 400;
    font-size: var(--acx-subtitle-6-font-size);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-color: transparent;
    `
export const TooltipDate = styled.span`
    color: var(--acx-neutrals-70);
    font-weight: 700;
    `
export const TimelineLoaderWrapper = styled.div`
  height: 100%;
  padding-top: 5px;
  `
export const PopoverWrapper = styled.div`
  cursor: pointer;
  .ant-popover-inner-content {
    padding: 0px;
  }
`
export const DetailsWrapper = styled.div`
  padding: 4px 0;
`
export const Header = styled.h3`
  font-size: 10px;
  line-height: 16px;
  font-weight: 700;
  text-align: left;
  font-family: var(--acx-neutral-brand-font);
  color: var(--acx-primary-black);
  margin-bottom: 2px;
`
export const CloseRowWrapper = styled.div`
  text-align: end;
`
export const CloseIconContainer = styled.span`
  cursor: pointer;
  position: absolute;
  right: 11px;
  top: 11px;
`
export const Body = styled.div`
  display: flex;
  align-items: stretch;
`
export const VerticalLine = styled.div`
  width: 1px;
  margin-right: 20px;
  background: var(--acx-neutrals-30);
`
export const ListDetails = styled.div`
  width: 265px;
`
export const Wrapper = styled.section.attrs((props: { layers: Array<unknown> }) => props)`
  overflow-y: scroll;
  max-height: 300px;
  display: grid;
  grid-gap: 5px 15px;
  grid-template-columns:
    minmax(max-content, 160px)
    ${props => Array(props.layers.length - 1).fill('minmax(max-content, 20px)').join('\n')}
  ;
  font-family: var(--acx-neutral-brand-font);
  line-height: var(--acx-body-5-line-height);
  font-style: normal;
  font-weight: var(--acx-body-font-weight);
  font-size: var(--acx-body-5-font-size);
  padding-right: 24px;
`

export const Container = styled.section.attrs((props: { layers: Array<unknown> }) => props)`
  grid-area: 1 / 1 / -1 / -1;
  display: grid;
  grid-gap: 5px 15px;
  grid-template-columns:
    minmax(min-content, 160px)
    ${props => Array(props.layers.length - 1).fill('minmax(max-content, 20px)').join('\n')}
  ;
`

export const Layer = styled.div`
  grid-row: 1 / -1;
  width: 16px;
  background-color: var(--acx-neutrals-70);
  justify-self: end;
  margin: 0 -16px;
  margin-left: 0;
  writing-mode: vertical-lr;
  display: flex;
  align-items: center;
  span {
    color: var(--acx-primary-white);
    position: sticky;
    top: 50%;
    transform: translateY(-50%);
  }
`

const stepFlowColorHelper = (state: string) => (state === 'failed')
  ? 'var(--acx-semantics-red-50)'
  : 'var(--acx-neutrals-60)'

const stepFlowMapper = (color: string) => ({
  left: css`
    border-right: 6px solid ${color};
  `,
  right: css`
    border-left: 6px solid ${color};
  `
})

export const StepFlow = styled.div.attrs((props: { direction: string, state: string }) => props)`
  align-self: center;
  display: flex;
  align-items: center;
  flex-direction: ${props => props.direction === 'left' ? 'row' : 'row-reverse'};

  &:after {
    content: '';
    display: block;
    height: 2px;
    background-color: ${props => stepFlowColorHelper(props.state)};
    flex: 1;
    ${props => (props.direction === 'left') ? 'margin-right: 2px' : 'margin-left: 2px'};
  }

  &:before {
    content: '';
    display: block;
    border: 0 solid transparent;
    border-width: 3px 0;
    ${props => {
    const color = stepFlowColorHelper(props.state)
    const stepFlowColor = stepFlowMapper(color)[props.direction as 'left' | 'right']
    return stepFlowColor}}

  }
`

export const StepLabel = styled.p`
  align-self: center;
  grid-column: 1 / 2;
  font-size: 11px;
  color: var(--acx-primary-black);
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0px;
  font-size: var(--acx-body-5-font-size);
`
type ChartWrapperProps = ElementType<HTMLDivElement> & {
  $selected?: boolean
  $hasAccess?: boolean
}

export const ChartWrapper = styled.div.attrs((props: ChartWrapperProps) => props)`
  path[d="M1 0A1 1 0 1 1 1 -0.0001"] {
    cursor: ${({ $hasAccess }) => $hasAccess ? 'pointer' : 'crosshair'} !important;
  }
  ${({ $selected, $hasAccess }) => $selected
  && `
    div[_echarts_instance_] {
      g[clip-path] {
        cursor: ${$hasAccess ? 'pointer' : 'crosshair'} !important;
      }
    }
  `
}
`

type HistoryItemWrapperProps = ElementType<HTMLDivElement> & {
  $selected: boolean
}

export const HistoryItemWrapper = styled.div.attrs((props: HistoryItemWrapperProps) => props)`
  ${({ $selected }) => $selected
  && `
    font-weight: var(--acx-body-font-weight-bold);

    .ant-list-item-meta-title {
      font-weight: var(--acx-body-font-weight-bold);
    }
  `
}
`
export const ErrorPanel = styled.div`
  display: flex;
  flex-grow: 1;
  text-align: center;
  background: var(--acx-neutrals-60);
  font-size: var(--acx-body-1-font-size);
  color: var(--acx-neutrals-15);
  > span {
    margin: auto;
  }
`
export const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  align-self: center;
`

export const Download = styled(DownloadOutlined)`
  position: absolute;
  left: -4px;
  margin-top: 3px;
`

export const PcapWrapper = styled.div`
  margin-top: 12px;
`

export const PcapSpin = styled(Spin)`
  position: relative;
  left: 15%;
`