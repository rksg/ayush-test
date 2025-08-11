import { Slider } from 'antd'
import styled     from 'styled-components'

import { WarningTriangleSolid } from '@acx-ui/icons'

export const SLAContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--acx-content-horizontal-space);
  height: 100%;
`

export const SubContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
`

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-top: auto;
`

export const UnsyncedWarningText = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  font-size: var(--acx-body-4-font-size);
`

export const WarningTriangleSolidIcon = styled(WarningTriangleSolid)`
  flex-shrink: 0;
  height: 16px;
  width: 16px;
  margin-right: 3px;
  path:nth-child(1) {
    fill: var(--acx-semantics-yellow-50)
  }
  path:nth-child(3) {
    stroke: var(--acx-accents-orange-30);
  }
`

export const SliderLabel = styled.span<{ isSelected: boolean }>`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-body-5-font-size);
  ${(props) =>
    props.isSelected
      ? `
    color: var(--acx-primary-black);
    font-weight: var(--acx-body-font-weight-bold);
  `
      : `
    color: var(--acx-neutrals-50);
    font-weight: var(--acx-body-font-weight);
  `}
`

export const SliderName = styled.div`
  font-size: var(--acx-body-4-font-size);
  color: var(--acx-neutrals-60);
`

export const StyledSlider = styled(Slider)`
  && .ant-slider-handle,
  && .ant-slider-handle:focus,
  && .ant-slider-handle:active,
  && .ant-slider-handle:hover {
    min-width: 15px;
    height: 15px;
    &:before {
      content: none;
    }
    background-color: var(--acx-primary-white);
    border: 2px solid var(--acx-accents-blue-25);
    padding: 0;
  }
`
