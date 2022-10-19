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

export const CheckboxGroup = styled(Checkbox.Group)`
  .ant-checkbox-wrapper {
    position: relative;
    font-size: 10px;
    width: 26px;
    height: 16px;
    margin-right: 4px;
    .channels > span + span {
      padding-left: 6px;
    }
    > span {
      width: 100%;  
      padding: 0;
    }  
    > span:first-child {
      display: none;
    }
    > span:last-child {
      position: relative;
      text-align: center;
      font-size: var(--acx-body-5-font-size);
      line-height: var(--acx-body-5-line-height);
      color: var(--acx-primary-white);
      user-select: none;
    }
    &::before {
      content: '';
      display: inline-block;
      position: absolute;
      top: -2px;
      left: 2px;
      width: 21px;
      height: 17px;
      -webkit-transform: perspective(20px) rotateX(25deg);
      background: var(--acx-neutrals-30);
      border: 1px solid var(--acx-neutrals-30);
    }
    &:hover {
      &::before {
        background: var(--acx-neutrals-40);
        border: 1px solid var(--acx-neutrals-40);
      }
    }

    &.ant-checkbox-wrapper-checked {
      &:before {
        border-color: var(--acx-accents-blue-50);
        background: var(--acx-accents-blue-50);
      }
      &:hover {
        &:before {
          border-color: var(--acx-accents-blue-60);
          background: var(--acx-accents-blue-60);
        }
      }
    }

    &.ant-checkbox-wrapper-disabled {
      > span:last-child {
        color: var(--acx-neutrals-30);
      }
      &:before {
        background: var(--acx-primary-white);
      }
    }
  }
  &.group-2 {
    .ant-checkbox-wrapper {
      width: 56px;
      &::before {
        width: 50px;
        top: -1px;
        -webkit-transform: perspective(20px) rotateX(10deg);
      }
    }
  }

  &.group-4 {
    .ant-checkbox-wrapper {
      width: 116px;
      &::before {
        width: 112px;
        top: -1px;
        -webkit-transform: perspective(20px) rotateX(4deg);
      }
    }
  }
  &.group-8 {
    .ant-checkbox-wrapper {
      width: 234px;
      &::before {
        width: 230px;
        top: -1px;
        -webkit-transform: perspective(20px) rotateX(2deg);
      }
    }
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