import { Row } from 'antd'
import styled  from 'styled-components/macro'

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
    border-bottom: 20px solid rgb(96, 159, 231);
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
    border-bottom: 20px solid rgb(172, 174, 176);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
  }
}
`