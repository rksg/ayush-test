import { Typography }  from 'antd'
import styled, { css } from 'styled-components/macro'

import {
  AccessPointWifi,
  ArrowChevronLeft,
  ArrowChevronRight,
  CheckMarkCircleOutline,
  CloseSymbol,
  Switch,
  WarningTriangleOutlined
} from '@acx-ui/icons'

const ellipsisStyle = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
`

export const SwitchIcon = styled(Switch)`
  --size: 100px;
  width: var(--size);
  height: var(--size);
  color: var(--acx-neutrals-70);
`

export const APIcon = styled(AccessPointWifi)`
  --size: 60px;
  width: var(--size);
  height: var(--size);
  color: var(--acx-neutrals-70);
  margin: 20px; // to account for white space of SwitchIcon
`

export const CloseIcon = styled(CloseSymbol)`
  --size: 16px;
  width: var(--size);
  height: var(--size);
  color: var(--acx-primary-black);

  position: absolute;
  top: 12px;
  right: 12px;
  cursor: pointer;
  z-index: 3;
`

export const PrevIcon = styled(ArrowChevronLeft).attrs({ 'data-testid': 'carousel-prev-button' })`
  &&& {
    --size: 32px;
    width: var(--size);
    height: var(--size);
    z-index: 1;
    top: 40px;
    &.slick-disabled path { stroke: var(--acx-neutrals-30); }
  }
`

export const NextIcon = styled(ArrowChevronRight).attrs({ 'data-testid': 'carousel-next-button' })`
  &&& {
    --size: 32px;
    width: var(--size);
    height: var(--size);
    z-index: 1;
    top: 40px;
    &.slick-disabled path { stroke: var(--acx-neutrals-30); }
  }
`

export const WarningIcon = styled(WarningTriangleOutlined)`
  --size: 24px;
  width: var(--size);
  height: var(--size);
  display: inline-block;
`

export const CheckIcon = styled(CheckMarkCircleOutline)`
  --size: 24px;
  width: var(--size);
  height: var(--size);
  display: inline-block;
`

export const CarouselContainer = styled.div`
  margin: 12px 24px 48px;
`

export const SlideContainer = styled.section`
  display: grid !important; // set !important to prevent slick-carousel inline display override
  grid-template-columns: 200px calc(100% - 400px) 200px;
  grid-template-rows: 100px 1fr;
  grid-template-areas:
    "from      connection to"
    "from-info     .      to-info";
  justify-items: center;
`

export const ConnectionContainer = styled.div`
  width: 100%;
  grid-area: connection;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const ConnectionText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  > span {
    ${ellipsisStyle}
    margin-left: 2px;
    margin-bottom: -2px;
    display: inline-block;
  }

  ${WarningIcon}, ${CheckIcon} {
    flex-grow: 0;
    flex-shrink: 0;
  }
`

export const Highlight = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: 700;
  text-align: center;
  height: 24px;

  margin: 0 20px; // prevent text render close to edge
`
export const MismatchedHighlight = styled(Highlight)`color: var(--acx-semantics-red-50);`
export const MatchedHighlight = styled(Highlight)`color: var(--acx-semantics-green-50);`

export const ConnectionLink = styled.div`
  border-bottom: 2px solid var(--acx-semantics-red-50);
  position: relative;
  width: calc(100% + 50px);
  margin: 4px -25px;
  &::before { left: 0; }
  &::after { right: 0; }
  &::before, &::after {
    background: var(--acx-semantics-red-50);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: absolute;
    bottom: -4px;
    content: '';
  }
`

export const DeviceContainer = styled.div`
  margin-top: -10px; // bleed into device icon
  text-align: center;
  white-space: nowrap;
  justify-self: stretch;

  p { margin: 0; }
`
export const DeviceName = styled.p`
  ${ellipsisStyle}
  color: var(--acx-primary-black);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`
export const DevicePort = styled.p`
  ${ellipsisStyle}
  color: var(--acx-neutrals-70);
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
`
export const DeviceDetails = styled.p`
  color: var(--acx-accents-blue-50);
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
`

export const PopoverContainer = styled.div`
  width: 300px;
`
export const PopoverTitle = styled(Typography.Title).attrs({ level: 4 })`
  &&& {
    font-weight: var(--acx-headline-4-font-weight-bold);
  }
`
export const UntaggedVLANHighlight = styled.span<{ $highlight: boolean }>`
  ${props => props.$highlight ? 'color: var(--acx-accents-blue-50);' : ''}
`

export const FootNote = styled.p`
  margin: 0;
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
`

export const ExportButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  margin-top: -40px; /* Pull up to align with card title */
  margin-right: 8px; /* Add some spacing from the right edge */
`