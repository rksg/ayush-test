import styled, { css } from 'styled-components/macro'

const arrowStyle = css`
  path {
    stroke: var(--acx-primary-black);
  }
  width: 8px;
  height: 8px;
  vertical-align: middle;
`
export const LineStyleWrapper = styled.div`
  height: 100%;
  width: 2px;
  background-color: var(--acx-primary-white);
  pointer-events: auto;
`
export const CircleWrapper = styled.div`
  display: grid;
  grid-auto-flow: column;
  place-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  pointer-events: auto;
  background-color: var(--acx-primary-white);

  .arrow-left {
    ${arrowStyle}
    stroke-width: 2px;
  }

  .arrow-right {
    ${arrowStyle}
    stroke-width: 2px;
  }
`
export const CustomHandleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  place-items: center;
  height: 100%;
  cursor: ew-resize;
  pointer-events: none;
  color: var(--acx-primary-white);
`