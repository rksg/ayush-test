// @ts-nocheck
import styled, { css } from 'styled-components/macro'

const DefaultSection = styled.div`
  background-color: rgb(255, 255, 255);
  padding: 10px;
  min-height: 20px;
  border-radius: 3px;
  // box-shadow: 0px 1px 2px #000;
  &:not(:first-of-type) { margin-top: 10px; }
  overflow: hidden;
`
export const Title = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: rgba(91, 117, 131, 1);
`

export const Section = styled(DefaultSection)`
  position: relative;
  margin-top: 10px;
`

export const PieChartContainer = styled.div`
  flex-basis: 450px;
  border-width: 0px 1px 0px 0px;
  border-style: solid;
  border-color: rgba(173, 186, 193, 1);
`

export const Separator = styled.hr.attrs((props: {
    $center?: number
}) => props)`
  border-top: 0.5px solid rgba(173, 186, 193, 1);
  margin: 0px 10px;
  ${props => props.$center
    ? css`:after, :before {
          content: "";
          display: block;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-bottom-color: var(--acx-primary-white);
          outline-color: rgba(173, 186, 193, 1);
          border-top: 0px;
          position: absolute;
          top: -10px;
        }`
    : css`:after, :before {
          content: "";
          display: block;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-bottom-color: var(--acx-primary-black);
          border-top: 0px;
          position: absolute;
          top: -10px;
          left: 50%;
        }`
  }

`

export const ImpactedClientsContainer = styled.div`
  flex-grow: 1;
  padding-left: 20px;
  .ReactTable {
    height: 250px;
  }
`

export const Level2Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 280px;
`
export const LoaderContainer = styled.div`
  height: 100%;
`
export const Next = styled.div`
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 10px solid rgba(91, 117, 131, 1);
`
export const Prev = styled.div`
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid rgba(91, 117, 131, 1);
`
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  & .carousel-control-prev, .carousel-control-next {
    top: 50%;
    height: 20px;
  }
`
export const Heading = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 10px;
  font-size: 12px;
  color: rgba(32, 53, 67, 1);
`
export const HeadingNoPadding = styled(Heading)`
  padding-left: 0
`
export const HeadingText = styled.div``

export const ChartContainer = styled.div`
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
export const Stage = styled.div`
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

export const Label = styled.div`
  position: absolute;
  cursor: pointer;
  height: 30px;
  line-height: 30px;
  font-size: 12px;
  font-weight: bold;
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
export const Pin = styled.div`
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
