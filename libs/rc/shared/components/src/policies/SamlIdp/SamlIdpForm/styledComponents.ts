
import styled from 'styled-components/macro'

import { ImportFileDrawer } from '../../../ImportFileDrawer'

export const Description = styled.div`
  color: var(--acx-neutrals-60);
  font-size: var(--acx-body-4-font-size);
  margin-bottom: 8px;
`

export const ImportXMLFileDrawer = styled(ImportFileDrawer)`
  .ant-drawer-footer {
    display: flex;
    justify-content: flex-end !important;
  }
`