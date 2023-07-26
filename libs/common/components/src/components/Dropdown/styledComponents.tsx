import { Dropdown as AntDropdown } from 'antd'
import styled                      from 'styled-components/macro'

import { CaretDownSolid } from '@acx-ui/icons'

import { Subtitle } from '../Subtitle'

export const Dropdown = styled(AntDropdown)`
  cursor: pointer;

  &.ant-btn:not(.ant-btn-icon-only):has(svg) {
    padding-left: 11px;
    padding-right: 7px;
  }
`

export const OverlayContainer = styled.div`
  padding: 12px 16px;
  border-radius: 4px;
  background-color: var(--acx-primary-white);
  box-shadow: 0px 6px 16px rgba(51, 51, 51, 0.2);
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: var(--acx-body-4-line-height);
`

export const OverlayTitle = styled(Subtitle).attrs({ level: 4 })``

export const CaretDownSolidIcon = styled(CaretDownSolid)`display: flex;`
