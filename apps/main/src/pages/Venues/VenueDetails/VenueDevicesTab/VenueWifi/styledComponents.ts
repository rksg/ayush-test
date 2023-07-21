import styled from 'styled-components/macro'

import { Tabs } from '@acx-ui/components'
import {
  ArrowCorner,
  SignalDown,
  SignalLeft,
  SignalUp,
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

export const SignalDownIcon = styled(SignalDown)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    stroke: var(--acx-primary-black);
  }
`

export const SignalUpIcon = styled(SignalUp)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    stroke: var(--acx-primary-black);
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
