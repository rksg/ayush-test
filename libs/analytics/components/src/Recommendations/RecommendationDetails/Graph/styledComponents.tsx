import styled from 'styled-components'

import { Card } from '@acx-ui/components'

import { detailsHeaderFontStyles } from '../styledComponents'

export const Wrapper = styled.div`
  position: relative;
  height: 385px;
  margin-top: 40px;

  ${Card.Title} {
    ${detailsHeaderFontStyles}
  }
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
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  height: 100%;
  width: 100%;
`

export const DrawerGraphWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 1fr;
  grid-template-rows: 19fr 1fr;
  gap: 10px;
  width: 100%;
  height: 100%;
  .ant-space {
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
`

export const LegendWrapper = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
  padding: 10px 0px;
`

export const LegendTitle = styled.div`
  color: var(--acx-primary-black);
  font-size: 12px;
  font-weight: bold;
  `

export const LegendText = styled.div`
  color: var(--acx-primary-black);
  font-size: 12px;
`

export const Circle = styled.span<{ $size: string }>`
  display: inline-block;
  width: ${props => props.$size};
  height: ${props => props.$size};
  border-radius: 50%;
  border: 1px solid var(--acx-neutrals-60);
  justify-self: end;
`

export const Square = styled.span<{ $color: string }>`
  background-color: ${props => props.$color};
  display: inline-block;
  width: 20px;
  height: 20px;
  justify-self: end;
`

export const Monitoring = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  background: var(--acx-primary-white);
  color: var(--acx-neutrals-50);
  border: 1px solid var(--acx-neutrals-50);
`
