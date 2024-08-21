import styled from 'styled-components/macro'

export const SliderBefore = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: start;
`

export const SliderAfter = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: end;
`

export const SliderText = styled.div`
  display: flex;
  align-items: center;
`

export const LabelStyleBefore = styled.div`
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  position: absolute;
  top: 0;
  padding: 15px;
  color: white;
  transition: opacity 0.25s ease-in-out;
`

export const LabelStyleAfter = styled.div`
  font-size: var(--acx-subtitle-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  font-weight: var(--acx-subtitle-5-font-weight);
  position: absolute;
  top: 0;
  padding: 15px;
  transition: opacity 0.25s ease-in-out;
`
