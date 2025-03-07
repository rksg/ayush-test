import { Form as AntdForm, Space } from 'antd'
import styled                      from 'styled-components/macro'

import { TagsOutline, TagsSolid } from '@acx-ui/icons'

export const GroupListLayout = styled('div')`
  display: flex;
  flex-direction: column;
  margin: 10px 0;
  max-height: calc( 100vh - 450px);
  min-height: 450px;

  div.ant-radio-group{
    width: 100%;
    .ant-radio-input {
      display: none;
    }
  }

  label.ant-radio-wrapper-in-form-item {
    display: flex;
    width: 100%;
    margin: 4px 0;
    padding: 2px;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
  }

  label.ant-radio-wrapper-checked {
    display: flex;
    width: 100%;
    margin: 4px 0;
    padding: 2px;
    font-size: var(--acx-body-4-font-size);
    color: var(--acx-primary-black);
    background: var(--acx-accents-orange-20);
  }

  .ant-card{
    min-height: 420px;
    padding-left: 0;
    padding-right: 0;
  }
  
  .ant-radio-inner{
    display: none;
  }
`

export const Module = styled.div`
  padding-bottom: 10px;
  div.lightblue.ant-checkbox-group {
    padding-top: 10px;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 20px;
      height: 20px;
      align-items: center;
      border: 1px solid var(--acx-neutrals-60);
      background-color: white;
      margin-right: 0px;

      > span:first-child {
        display: none;
      }
    }

    > label.ant-checkbox-wrapper:has(.ant-checkbox-disabled)  {
      width: 20px;
      height: 20px;
      align-items: center;
      background-color: var(--acx-neutrals-15);
      border: solid 1px var(--acx-neutrals-25);
      margin-right: 0px;
    }

    > label.ant-checkbox-wrapper-checked {
      background-color: #d7f8fb;
      border: solid 1px #5de0ec;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }

    > label:nth-child(even) p {
      margin-top: 2px;
      margin-left: -2px;
      text-align: center;
    }

    > label:nth-child(odd) p {
      margin-top: -37px;
      margin-left: -2px;
      text-align: center;
    }
  }
  
  div.purple.ant-checkbox-group {
    padding-top: 10px;
    padding-bottom: 20px;
    display: grid;
    grid-template-columns: auto auto auto;
    grid-template-rows: auto auto;
    grid-gap: 5px;
    grid-auto-flow: column;
    justify-content: start;
    > label.ant-checkbox-wrapper {
      width: 20px;
      height: 20px;
      align-items: center;
      border: 1px solid var(--acx-neutrals-60);
      background-color: white;
      margin-right: 0px;

      > span:first-child {
        display: none;
      }
    }
    
    > label.ant-checkbox-wrapper:has(.ant-checkbox-disabled)  {
      width: 20px;
      height: 20px;
      align-items: center;
      background-color: var(--acx-neutrals-15);
      border: solid 1px var(--acx-neutrals-25);
      margin-right: 0px;
    }

    > label.ant-checkbox-wrapper-checked {
      background-color: #dcc9ed;
      border: solid 1px #7025b6;
    }

    > label.ant-checkbox-wrapper:last-child {
      border-right-width: 1px;
    }

    > label:nth-child(even) p {
      margin-top: 2px;
      margin-left: -2px;
      text-align: center;
    }

    > label:nth-child(odd) p {
      margin-top: -37px;
      margin-left: -2px;
      text-align: center;
    }
  }

  .ant-checkbox + span {
    padding: 0;
    width: 20px;
    height: 20px;
  }
`

export const TagsOutlineIcon = styled(TagsOutline)`
  display: flex;
  width: 16px;
  height: auto;
  path {
    fill: var(--acx-primary-white);
  }
`

export const TagsSolidIcon = styled(TagsSolid)`
  display: flex;
  width: 16px;
  height: auto;
  path {
    fill: var(--acx-primary-white);
  }
`

export const TooltipTitle = styled(Space)`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-neutrals-40);  
`

export const TagsTitle = styled(Space)`
  display: flex;
  padding: 4px 0;
  gap: 4px !important;
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  color: var(--acx-neutrals-40);
`

export const PortSpan = styled.div`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
  padding-left: 20px;
`

export const CardStyle = styled.div`
  background-color: var(--acx-neutrals-10);
  height: auto;
  margin-bottom: 4px;
  border-radius: 4px;
  .ant-typography {
    font-size: 12px;
  }
  .title {
    font-size: 12px;
    font-weight: 700;
    padding: 8px 20px;
    background-color: var(--acx-neutrals-20);
    margin: 0 !important;
  }
  .content {
    padding: 12px 20px;
  }
  &:last-child {
    margin-bottom: 60px;
  }
`

export const Form = styled(AntdForm)`
  .ant-form-item {
    margin-bottom: 0px !important;
    .ant-form-item {
      margin-bottom: 0px !important;
    }
  }
  &.ant-form.ant-form-horizontal {
    > .ant-form-item {
      margin-bottom: 6px !important;
    }
    .ant-form-item-label {
      height: 32px;
      margin-bottom: 16px;
      padding-bottom: 0;
      width: 160px;
    }
    .ant-form-item-control-input-content {
      padding-bottom: 0;
      .ant-form-item-control-input-content {
        max-width: 300px;
      }
    }
  }
`

export const FormItem = styled(AntdForm.Item)`
  &.ant-form-item {
    margin-bottom: 10px;
  }
  
  .ant-form-item-control-input-content {
    padding-bottom: 4px;
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

  .ant-form-item-row {
    display: flex;
    flex-flow: row wrap;
    min-width: 0;
  }

  .ant-form-item-label {
    align-content: center;
  }

  label ~ .ant-form-item {
    margin-bottom: 10px;
  }

  label + .ant-form-item,
  label + div {
    padding-left: 8px;
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
