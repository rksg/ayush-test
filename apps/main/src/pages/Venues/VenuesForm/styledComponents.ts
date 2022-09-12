import styled from 'styled-components/macro'

import {
  Close
} from '@acx-ui/icons'

export const CloseIcon = styled(Close)`
width: 10px;
height: 10px;
path {
  stroke: var(--acx-primary-black);
}
`
export const AddressContainer = styled.div`
  .ant-input-suffix {
    right: 0;
  }
  .ant-form-item-explain-error {
    width: fit-content;
    background-color: var(--acx-primary-white);
    opacity: 0.9;
  }
`
