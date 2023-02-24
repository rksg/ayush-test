import { Radio } from 'antd'
import styled    from 'styled-components/macro'

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

export const IconRadioGroup = styled(Radio.Group)`
  padding: 16px 0px;
  & > .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    background: var(--acx-accents-orange-50);
    border-color: var(--acx-accents-orange-50);
    &::before {
      background-color: var(--acx-accents-orange-50);
    }

    svg {
      path[stroke] {
        stroke: currentColor;
      }
      path[fill] {
        fill: currentColor;
      }
    }
  }
  & > .ant-radio-button-wrapper{
    svg {
      width: 22px;
      height: 22px;
    }
  }
`