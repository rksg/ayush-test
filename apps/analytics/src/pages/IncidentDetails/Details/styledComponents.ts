import AutoSizer from 'react-virtualized-auto-sizer'
import styled    from 'styled-components/macro'

import { LayoutUI } from '@acx-ui/components'

export const FixedAutoSizer = styled(AutoSizer)`
  position: fixed;
`

export const MuteIncidentContainer = styled.div`
  width: 200px;
  .ant-switch {
    width: 44px;
    height: 22px;
  }
  .ant-switch-handle {
    width: 16px;
    height: 16px;
    top: 3px;
  }
  .ant-switch-handle::before {
    border-radius: 8px;
  }
  .ant-switch-checked .ant-switch-handle {
    left: calc(100% - 18px);
  }
  p {
    margin: 10px 0 0 0 !important;
  }
`
export const IconContainer = styled(LayoutUI.Icon)`
  svg path {
    stroke: var(--acx-primary-black);
    vertical-align: middle;
  }
  border: 1px solid var(--acx-primary-black);
  border-radius: 3px;
  padding: 3px;
  display: flex;
`
