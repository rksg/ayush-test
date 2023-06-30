import { Select } from 'antd'
import styled     from 'styled-components/macro'

export const RadioFormSelect = styled(Select)`
 &.readOnly {
   pointer-events: none;

   .ant-select-selector {
    padding-left: 0;
   }
 }
`