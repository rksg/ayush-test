import styled, { css } from 'styled-components/macro'

export const SliderBefore = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: start;
  background-color: var(--acx-primary-black);
`
export const SliderAfter = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: end;
  background-color: var(--acx-primary-white);
`

const labelStyle = css`
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  position: absolute;
  top: 0;
  padding: 10px 15px;
  transition: opacity 0.25s ease-in-out;
`

export const LabelStyleBefore = styled.div`
  ${labelStyle}
  color: var(--acx-primary-white);
  display: grid;
  grid-template-columns: 1fr 20px;
  align-items: center;
  justify-items: start;
  grid-row-gap: 2px;
  grid-column-gap: 4px;
  > span:nth-child(1) {
    grid-column: 1 / -1;
  }
  > span:nth-child(2) {
    grid-column: 1 / -1;
  }
`

export const LabelStyleAfter = styled.div`
  ${labelStyle}
  color: var(--acx-primary-black);
  display: grid;
  grid-template-columns: 1fr 20px;
  align-items: center;
  justify-items: end;
  grid-row-gap: 2px;
  grid-column-gap: 4px;
  > span:nth-child(1) {
    grid-column: 1 / -1;
  }
  > span:nth-child(2) {
    grid-column: 1 / -1;
  }
  > span:nth-child(3) {
    font-size: var(--acx-subtitle-6-font-size);
    line-height: var(--acx-subtitle-6-line-height);
    font-weight: var(--acx-subtitle-6-font-weight);
  }
`
