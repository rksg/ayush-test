import styled from 'styled-components'

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

export const GraphWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 0.25fr 3fr 1.5fr;
  height: 100%;
  width: 100%;
`

export const DownloadWrapper = styled.div`
  width: fit-content;
`

export const DrawerGraphWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 0.25fr 3fr 1.5fr;
  grid-template-rows: 19fr 1fr;
  gap: 10px;
  width: 100%;
  height: 100%;
  ${DownloadWrapper} {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row-start: 2;
    grid-row-end: 3;
    justify-self: center;
  }
`

export const LegendsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: min-content;
  grid-row-gap: 20px;
  margin-left: 10px;
`

export const LegendWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  padding: 10px 0px;
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

export const Square = styled.span<{ $color: string }>`
  background-color: ${props => props.$color};
  display: inline-block;
  width: 12px;
  height: 12px;
  justify-self: end;
  margin-top: 4px;
`

export const CrrmArrow = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
`

export const RightArrow = styled(ArrowChevronRight)`
  transform: scale(1.8);
`

export const ViewMoreButton = styled(Button).attrs({ size: 'small', type: 'link' })`
  position: absolute;
  bottom: 12px;
  right: 16px;

  :hover {
    text-decoration: underline;
  }
`

export const GraphBeforeTextWrapper = styled.div`
  position: absolute;
  top: 4%;
  left: 3%;
`

export const GraphAfterTextWrapper = styled.div`
  position: absolute;
  top: 4%;
  right: 35%;
  color: var(--acx-primary-black);
  font-size: var(--acx-body-3-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-headline-4-font-weight-bold);
`

export const GraphTitleText = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-body-3-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-headline-4-font-weight-bold);
`

export const GraphSubTitleText = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-5-line-height);
  font-weight: var(--acx-headline-4-font-weight);
`
