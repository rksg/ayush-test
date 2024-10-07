import styled from 'styled-components'

import { ArrowChevronRight } from '@acx-ui/icons'

export const Wrapper = styled.div<{ isDetail: boolean }>`
  position: relative;
  height: ${(props) => props.isDetail? '243px': '180px'};
`

export const GraphWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 3fr 0.6fr 3fr 1.8fr;
  width: 100%;
  height: 100%;
`

export const GraphTitleWrapper = styled.div`
  width: 100%;
  position: absolute;
  text-align: center;
  top: 0px;
  left: 0px;
  display: grid;
  grid-template-columns: 3fr 0.6fr 3fr 1.8fr;
`

export const GraphTitle = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  font-weight: var(--acx-subtitle-4-font-weight);
`

export const GraphSubTitleWrapper = styled.div`
  width: 100%;
  position: absolute;
  text-align: center;
  bottom: 0px;
  left: 0px;
  display: grid;
  grid-template-columns: 3fr 0.6fr 3fr 1.8fr;
`

export const GraphSubTitle = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight);
`

export const DonutChartWrapper = styled.div<{ isDetail: boolean }>`
  text-align: center;
  margin-top: ${(props) => props.isDetail? '40px': '0px'};
`

export const ArrowWrapper = styled.div`
  align-self: center;
  justify-self: center;
`

export const RightArrow = styled(ArrowChevronRight)`
  transform: scale(1.8);
`

export const LegendWrapper = styled.div`
  margin-left: 3em;
`

export const LegendItems = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  padding: 10px 0px;
  align-items: start;
  justify-items: start;
`

export const LegendTitle = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  `

export const LegendText = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-body-font-weight);
`

export const LegendCircle = styled.span<{ $color: string }>`
  background-color: ${props => props.$color};
  border-radius: 50%;
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-top: 2px;
`