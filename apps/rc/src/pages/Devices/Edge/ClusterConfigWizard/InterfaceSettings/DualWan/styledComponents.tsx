import { Form } from 'antd'
import styled   from 'styled-components/macro'

import { cssStr }                                          from '@acx-ui/components'
import { DeleteOutlined, Drag, EditOutlined, CloseSymbol } from '@acx-ui/icons'

export const DragIcon = styled(Drag)`
  cursor: grab;
 `

export const DeleteOutlinedIcon = styled(DeleteOutlined)`
 path {
   stroke: var(--acx-accents-blue-50) !important;
 }
`
export const EditOutlinedIcon = styled(EditOutlined)`
 path {
   stroke: var(--acx-accents-blue-50) !important;
 }
`
export const CloseSymbolIcon = styled(CloseSymbol)`
 path {
   stroke: var(--acx-accents-blue-50) !important;
 }
`
interface DragIconWrapperProps extends React.PropsWithChildren {
  disabled?: boolean;
  'data-testid'?: string;
}

export const DragIconWrapper = styled.div<DragIconWrapperProps>`
  text-align: center;
  pointer-events: ${(props) => props.disabled && 'none'};
  cursor: ${(props) => props.disabled && 'none'};
  & svg > path {
    fill: ${(props) => props.disabled ? cssStr('--acx-neutrals-40') : cssStr('--acx-neutrals-70')};
  }
`

export const StyledFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
  & .ant-col.ant-form-item-control {
    margin-top: 0px;
  }
`

export const StyledHiddenFormItem = styled(Form.Item)`
  &.ant-form-item {
    margin-bottom: 0px;
  }
 .ant-form-item-control-input {
    display: none;
  }
`