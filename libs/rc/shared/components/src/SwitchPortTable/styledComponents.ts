import { Divider as AntDivider, Form as AntdForm } from 'antd'
import styled                                      from 'styled-components/macro'

import { TagsOutline, TagsSolid } from '@acx-ui/icons'

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 14px;
  height: 16px;
  vertical-align: middle;
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 14px;
  height: 16px;
  vertical-align: middle;
  margin-left: 6px;
`

export const Form = styled(AntdForm)`
  &.ant-form.ant-form-horizontal > .ant-form-item {
    margin-bottom: 20px !important;
    label {
      color: var(--acx-primary-black);
      &::after {
        display: none;
      }
    }
  }
`

export const FormItem = styled(AntdForm.Item)`
  &.ant-form-item {
    margin-bottom: 10px;
  }
  
  .ant-form-item-control-input-content {
    &:first-child {
      display: flex;
      width: 100%;
    }
  }

  .ant-checkbox-wrapper {
    align-items: center;
    max-height: 32px;
    .ant-checkbox {
      top: 0;
    }
  }

  .ant-form-item {
    width: 248px;
  }

  label ~ .ant-form-item {
    margin-bottom: 10px;
  }

  label + .ant-form-item,
  label + div {
    padding-left: 10px;
  }

  .ant-switch-checked.ant-switch-disabled.switch-checked-fade {
      opacity: 50%;
      border-color: var(--acx-accents-blue-50);
      .ant-switch-handle::before {
        background: var(--acx-accents-blue-50);
      }
    }
  }
`

export const ExtraLabel = styled('div')`
  display: inline-flex;
  width: 172px;
  font-size: var(--acx-body-4-font-size)
`

export const GroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-height: calc( 100vh - 450px);
  min-height: 60px;
  overflow-y: scroll;
  label {
    display: flex;
    margin: 4px 0;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }
`
export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  background: var(--acx-neutrals-50);
  width: 1px;
  height: 14px;
`

export const ContentDivider = styled(AntDivider).attrs({ type: 'horizontal' })`
  background: var(--acx-neutrals-20);
  margin: 16px 0px 28px !important
`

export const PortStatus = styled.div`
  font-size: var(--acx-subtitle-5-font-size);
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
  margin-bottom: 30px;
  .profile{
    font-weight: var(--acx-body-font-weight); 
    margin-left: 4px;
  }
`

export const VoiceVlan = styled.div`
  font-size: var(--acx-subtitle-3-font-size);
`

export const TaggedVlanTab = styled.div`
  display: flex;
  align-items: center;
  svg {
    fill: var(--acx-accents-orange-50);
    stroke: var(--acx-accents-orange-50);
    color: var(--acx-accents-orange-50);
    margin-left: 5px;
  }
`

export const FieldErrorMessage = styled.div`
  font-size: var(--acx-body-3-font-size);
  color: var(--acx-semantics-red-50);
  margin-top: 10px;
`

export const VoiceVlanSwitch = styled.div`
  margin-bottom: 10px;
  .switch {
    margin-left: 24px;
    .ant-switch {
      margin-left: 4px;
    }
  }
  .invalid.ant-switch-checked {
    border-color: var(--acx-semantics-red-50);
    .ant-switch-handle::before {
      background-color: var(--acx-semantics-red-50);
    }
  }
`