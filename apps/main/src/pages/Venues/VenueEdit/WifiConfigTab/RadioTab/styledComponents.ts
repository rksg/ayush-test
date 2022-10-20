import { Row, Checkbox } from 'antd'
import styled            from 'styled-components/macro'

import { Button } from '@acx-ui/components'

export const RowStyle = styled(Row)`
  .ant-form-item-label > label {
    color: var(--acx-primary-black);
  }
  .ant-form-item {
    color: var(--acx-neutrals-60)
  }
`

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`

export const FieldLabel = styled.div<{ width: string }>`
font-size: var(--acx-body-4-font-size);
display: block;
line-height: 32px;
grid-template-columns: ${props => props.width} 1fr;
`

export const MultiSelect = styled.div`
div.ant-checkbox-group {
  display: inline-block;
  > label.ant-checkbox-wrapper {
    font-size: 12px;
    width: 32px;
    height: 0;
    margin-bottom: 30px;
    border-bottom: 20px solid rgb(172, 174, 176);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;

    > span {
      width: 50px;  
      padding: 0;
    }

    > span:first-child {
      display: none;
    }
    > span:last-child {
      position: relative;
      top: 20px;
      text-align: center;
    }
  }

  > label.ant-checkbox-wrapper-checked {
    border-bottom: 20px solid rgb(96, 159, 231);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
  }
}
`
const channelWidth = '26px'
const channelMarginRight = '4px'

export const CheckboxGroup = styled(Checkbox.Group)`
  .ant-checkbox-wrapper {
    position: relative;
    font-size: 10px;
    width: ${channelWidth};
    height: 0;
    margin-right: ${channelMarginRight};
    border-bottom: 16px solid var(--acx-neutrals-30);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    .channels > span + span {
      padding-left: 6px;
    }
    > span {
      width: 100%;  
      padding: 0;
      &:first-child {
        display: none;
      }
      &:last-child {
        position: relative;
        text-align: center;
        font-size: var(--acx-body-5-font-size);
        line-height: var(--acx-body-5-line-height);
        color: var(--acx-primary-white);
        user-select: none;
      }
    }
    &:hover {
      border-bottom-color: var(--acx-neutrals-40);
    }

    &.ant-checkbox-wrapper-checked {
      border-bottom-color: var(--acx-accents-blue-50);
      &:hover {
        border-bottom-color: var(--acx-accents-blue-60);
      }
    }

    &.ant-checkbox-wrapper-disabled:not(.ant-checkbox-wrapper-checked) {
      border-bottom-color: var(--acx-neutrals-30);
      > span:last-child {
        color: var(--acx-neutrals-30);
      }
      &:before {
        content: '';
        display: inline-block;
        position: absolute;
        border-bottom: 14px solid var(--acx-primary-white);
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        width: calc(100% + 6px);
        left: -3px;
        top: 1px;
      }
    }
  }
  &.group-2 .ant-checkbox-wrapper {
    width: calc(${channelWidth}*2 + ${channelMarginRight});
  }
  &.group-4 .ant-checkbox-wrapper {
    width: calc(${channelWidth}*4 + ${channelMarginRight}*3);
  }
  &.group-8 .ant-checkbox-wrapper {
    width: calc(${channelWidth}*8 + ${channelMarginRight}*7);
  }
}
`

const BarButton = styled(Button)`
  height: 16px;
  border-radius: 0;
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
  margin: 0 4px 3px 0;
`

export const Button5G = styled(BarButton)`
  border: 1px solid var(--acx-accents-orange-25);
  background: var(--acx-accents-orange-25);
  &[disabled] {
    border: 1px solid var(--acx-accents-orange-25) !important;
    background: var(--acx-accents-orange-25) !important;
    color: var(--acx-primary-black) !important;
  }
  &:hover, &:focus, &:active {
    border-color: var(--acx-accents-orange-30);
    background: var(--acx-accents-orange-25);
  }  
`
export const ButtonDFS = styled(BarButton)`
  border: 1px solid var(--acx-accents-orange-10);
  background: var(--acx-accents-orange-10);
  &[disabled] {
    border: 1px solid var(--acx-accents-orange-10) !important;
    background: var(--acx-accents-orange-10) !important;
    color: var(--acx-primary-black) !important;
  }
  &:hover, &:focus, &:active {
    border-color: var(--acx-accents-orange-20);
    background: var(--acx-accents-orange-10);
  }  
`