import { Radio, Switch } from 'antd'
import styled                          from 'styled-components/macro'

export const CleanExpiredSwitch = styled(Switch)`
  &.ant-switch {
    background: lightgrey;
    &-checked {
      border-color: var(--acx-accents-blue-50);
      .ant-switch-handle::before { background-color: white; }
      background: green;
  }
`

export const DefaultAccessRadioButton = styled(Radio.Button)`


  &.ant-radio-group {
    width: 100%;
  }

  &.ant-radio-button-wrapper {
    height: 30px !important;
    line-height: 30px !important;
  }

  &.ant-radio-button-wrapper-checked {
    background: green;
  }

  &.ant-radio-button-wrapper-in-form-item > span {
    color: lightgrey;
  }

  &.ant-radio-button-wrapper-checked > span {
    color: white;
  }
`
