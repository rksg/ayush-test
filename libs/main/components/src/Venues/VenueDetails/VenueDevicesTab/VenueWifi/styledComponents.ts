import styled from 'styled-components/macro'

import { Tabs, Alert as UIAlert } from '@acx-ui/components'
import {
  ArrowCorner,
  SignalLeft,
  Wired
} from '@acx-ui/icons'

export const SpanStyle = styled.span`
color: var(--acx-primary-white);
`

export const ArrowCornerIcon = styled(ArrowCorner)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    fill: currentColor;
  }
`

export const ApSingleIcon = styled(SignalLeft)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    fill: currentColor;
  }
`

export const MeshSignalSpan = styled.span`
  svg {
    vertical-align: middle;
    margin-right: 2px;
  }
`

export const WiredIcon = styled(Wired)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    fill: currentColor;
  }
`

export const IconThirdTab = styled(Tabs).attrs({ type: 'third' })`
  .ant-tabs-tab  {
    padding: 3px 7px 1px !important;
    height: 30px;
  }
`
export const AlertNote = styled(UIAlert)`
  &.ant-alert-info {
    width: 500px;
    height: 28px;
    border-radius: 4px;
  }
`
