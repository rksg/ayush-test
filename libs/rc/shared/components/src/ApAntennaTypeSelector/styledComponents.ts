import styled from 'styled-components'

import { Select } from '@acx-ui/components'


export const ReadOnlySelect = styled(Select)`
 &.readOnly {
   pointer-events: none;

   .ant-select-selector {
    padding-left: 0;
   }
 }
`