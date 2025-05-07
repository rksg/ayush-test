import { Space } from 'antd'
import styled    from 'styled-components'

import { Button }            from '@acx-ui/components'
import { ArrowChevronRight } from '@acx-ui/icons'

export const Wrapper = styled.div`
  position: relative;
  height: 385px;
`

export const ClickableWrapper = styled.div`
  position: absolute;
  z-index: 1;
  cursor: pointer;
  height: 100%;
  width: 100%;
`

export const DownloadWrapper = styled.div`
  width: fit-content;
`

export const GraphWrapper = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 3fr 0.6fr 3fr;
  width: 100%;
  height: 100%;
`

export const GraphTitleWrapper = styled.div`
  width: 100%;
  position: absolute;
  top: 30px;
  left: 0px;
  display: grid;
  grid-template-columns: 3.6fr 3fr;
`

export const GraphLegendWrapper = styled.div`
  width: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  display: grid;
`

export const GraphTitle = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  background-color: var(--acx-primary-white);
  width: fit-content;
  height: fit-content;
  padding-inline: 0.25em;
  margin-left: -0.25em;
`

export const GraphSubTitle = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight);
  background-color: var(--acx-primary-white);
  width: fit-content;
  height: fit-content;
  padding-inline: 0.25em;
  margin-left: -0.25em;
`

export const CrrmArrow = styled.div`
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
  display: flex;
  grid-template-columns: auto 1fr;
  grid-column-gap: 5px;
  padding-bottom: 20px;
  align-items: start;
  justify-items: start;
  flex-direction: row;
  justify-content: flex-end;
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

export const LegendSquare = styled.span<{ $color: string }>`
  background-color: ${props => props.$color};
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-top: 2px;
  margin-left: 10px;
`

export const ViewMoreButton = styled(Button).attrs({ size: 'small', type: 'link' })`
  :hover {
    text-decoration: underline;
  }
`

export const GraphFooterWrapper = styled(Space)`
  justify-content: space-between;
  align-items: flex-start;
`

export const GraphWrapperLegacy = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 3fr 0.6fr 3fr 1.8fr;
  width: 100%;
  height: 100%;
`

export const GraphTitleWrapperLegacy = styled.div`
  width: 100%;
  position: absolute;
  top: 0px;
  left: 0px;
  display: grid;
  grid-template-columns: 3.6fr 4.8fr;
`

export const GraphTitleLegacy = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  font-weight: var(--acx-subtitle-4-font-weight);
  background-color: var(--acx-primary-white);
  width: fit-content;
  height: fit-content;
  padding-inline: 0.25em;
  margin-left: -0.25em;
`

export const LegendItemsLegacy = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  padding: 10px 0px;
  align-items: start;
  justify-items: start;
`
