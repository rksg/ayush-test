import styled from 'styled-components/macro'

export const CompareSliderWrapper = styled.div`
  .compare-slider {
    border: 1px solid var(--acx-neutrals-40);
    border-radius: 5px;
  }

  .custom-handle {
    display: flex;
    flex-direction: column;
    place-items: center;
    height: 100%;
    cursor: ew-resize;
    pointer-events: none;
    color: var(--acx-primary-white);
  }

  .handle-line {
    height: 100%;
    width: 2px;
    background-color: var(--acx-primary-white);
    pointer-events: auto;
  }

  .handle-circle {
    display: grid;
    grid-auto-flow: column;
    place-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    pointer-events: auto;
    background-color: var(--acx-primary-white);
  }

  .arrow-left, .arrow-right {
    path {
      stroke: var(--acx-primary-black);
    }
    width: 8px;
    height: 8px;
    vertical-align: middle;
    stroke-width: 4px;
  }
`