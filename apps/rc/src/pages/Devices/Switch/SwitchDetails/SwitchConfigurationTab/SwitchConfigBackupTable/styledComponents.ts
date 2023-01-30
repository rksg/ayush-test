import styled from 'styled-components/macro'

import { Modal } from '@acx-ui/components'

export const ViewModal = styled(Modal)`
.CodeMirror {
  border: 6px solid var(--acx-neutrals-30);
}

.description-container {
  display: flex;
}

.code-mirror-container {
  margin-top: 10px;
}

`

export const CompareModal = styled(Modal)`
.CodeMirror {
  border: 6px solid var(--acx-neutrals-25);
}

.merge-scroll-lock{
  position: absolute;
  z-index: 1;
  top: 162px;
  left: 24px;
  font-size: var(--acx-body-4-font-size);
  
  .ant-switch {
    background: #fafafa;
    border: 1px solid var(--acx-neutrals-60);
  }
}

`