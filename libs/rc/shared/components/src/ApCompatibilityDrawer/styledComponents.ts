import styled from 'styled-components/macro'

import {
  CheckMarkCircleSolid,
  WarningTriangleSolid,
  Unknown
} from '@acx-ui/icons'

export const StyledWrapper = styled.div`
  .ApCompatibilityDrawerFormItem .ant-form-item-control-input {
    min-height: 13px;
  }
`
export const CheckMarkCircleSolidIcon = styled(CheckMarkCircleSolid)`
  width: 14px;
  height: 14px;
  margin-bottom: -3px;
`

export const WarningTriangleSolidIcon = styled(WarningTriangleSolid)`
  width: 14px;
  height: 14px;
  margin-bottom: -3px;
`

export const UnknownIcon = styled(Unknown)`
  width: 14px;
  height: 14px;
  margin-bottom: -3px;
`