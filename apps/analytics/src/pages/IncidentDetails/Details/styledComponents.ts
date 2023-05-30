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
