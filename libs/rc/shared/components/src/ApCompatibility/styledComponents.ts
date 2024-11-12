import { Col }         from 'antd'
import styled, { css } from 'styled-components/macro'

import {
  CheckMarkCircleSolid,
  WarningTriangleSolid,
  Unknown,
  MinusCircleSolid,
  InProgress
} from '@acx-ui/icons'

export const StyledWrapper = styled.div`
  .ApCompatibilityDrawerFormItem .ant-form-item-control-input {
    min-height: 13px;
  }
`

const iconStyle = css`
  width: 16px;
  height: 16px;
  margin-bottom: -3px;
`
export const CheckMarkCircleSolidIcon = styled(CheckMarkCircleSolid)`
  ${iconStyle}
`

export const WarningTriangleSolidIcon = styled(WarningTriangleSolid)`
  ${iconStyle}
  path:nth-child(1) {
    fill: var(--acx-semantics-yellow-50)
  }
  path:nth-child(3) {
    stroke: var(--acx-accents-orange-30);
  }
`

export const UnknownIcon = styled(Unknown)`
  ${iconStyle}
`

export const UnavailableIcon = styled(MinusCircleSolid)`
  ${iconStyle}
  path:nth-child(1) {
    fill: var(--acx-neutrals-50)
  }
  path:nth-child(2) {
    stroke: var(--acx-neutrals-50);
  }
`

export const CheckingIcon = styled(InProgress)`
  circle {
    fill: var(--acx-neutrals-50);
    stroke: var(--acx-neutrals-50);
  }
  width: 22px;
  height: 22px;
  transform: scale(0.8);
`

export const TableStyleWrapper = styled.div`
  margin-left: 30px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
  .ActivityApCompatibilityTable .ant-table-wrapper {
    margin-top: 12px;
    border: 1px solid #e3e4e5;
    border-radius: 4px;
    padding: 2px;
  }
`

export const RowStyleWrapper = styled.div`
  width: 100%;
`

export const RowRightStyleWrapper = styled(Col)`
  width: 50%;  
  margin-top: 12px;
  text-align: right;
  height: var(--acx-body-3-line-height);
`


export const TotalStyleWrapper = styled.label`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  font-weight: var(--acx-body-font-weight);
`