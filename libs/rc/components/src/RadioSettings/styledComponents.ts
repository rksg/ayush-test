import {Form, Select} from 'antd'
import styled     from 'styled-components/macro'

export const RadioFormSelect = styled(Select)`
 &.readOnly {
   pointer-events: none;

   .ant-select-selector {
    padding-left: 0;
   }
 }
`

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 34px;
  grid-template-columns: ${props => props.width} 1fr;
`

export const RateLimitBlock = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      width: 50px;
    }
`

export const FormItemNoLabel = styled(Form.Item)`
  margin-bottom: 5px;
`

export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
`
