import styled from 'styled-components/macro'
import { Modal } from '@acx-ui/components'

export const ViewModal = styled(Modal)`
.CodeMirror {
  border: 6px solid var(--acx-neutrals-30);
}

.code-mirror-container {
  margin-top: 10px;
}

`

export const CompareModal = styled(Modal)`
.CodeMirror {
  border: 6px solid var(--acx-neutrals-30);
}

.merge-scroll-lock{
  position: absolute;
  z-index: 1;
  top: 120px;
  left: 50px;
  
  .ant-switch {
    background: #fafafa;
    border: 1px solid var(--acx-neutrals-60);
  }
}

`