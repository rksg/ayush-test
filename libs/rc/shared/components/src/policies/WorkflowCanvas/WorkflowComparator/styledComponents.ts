import styled from 'styled-components/macro'

import { Drawer as AntDrawer } from '@acx-ui/components'


export const Drawer = styled(AntDrawer)`
  .ant-drawer-header {
    border: none;
  }

  .ant-drawer-body {
    padding: 8px 0 0 0 !important;
  }
`
export const WorkflowComparatorHeader = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px
`
