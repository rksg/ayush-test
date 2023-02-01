import styled from 'styled-components/macro'

import { Modal as BaseModal } from '../Modal'

export const Modal = styled(BaseModal)`
  .ant-modal-body {
    padding-bottom: 0px;
  }
  .ant-modal-footer {
    display: none;
  }
`
