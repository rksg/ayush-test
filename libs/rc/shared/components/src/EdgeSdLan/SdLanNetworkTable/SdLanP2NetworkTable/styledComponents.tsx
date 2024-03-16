import styled from 'styled-components/macro'

export const DiagramContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 20px;
  display: block;
  text-align: center;

  & img {
    width: 250px;
  }
`

export const FrameOverDiagram = styled.div`
  position: absolute;
  top: 33px;
  left: 24px;
  width: 150px;
  height: 190px;
  border-radius: 8px;
  border: 4px solid var(--acx-accents-orange-50);
  z-index: 1;
`

export const TitleWithTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
`