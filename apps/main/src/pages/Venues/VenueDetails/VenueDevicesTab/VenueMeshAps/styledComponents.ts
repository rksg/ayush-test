import { Button } from 'antd'
import styled     from 'styled-components/macro'

import {
  ArrowCorner,
  ApSingle,
  List,
  ListSolid,
  LineChartOutline1,
  LineChartSolid1,
  Mesh,
  MeshSolid,
  SignalDown,
  SignalUp,
  Wired
} from '@acx-ui/icons'

export const SpanStyle = styled.span`
color: var(--acx-primary-white);
`

export const ListIcon = styled(List)`
display: 'inline';
alignItems: 'center';
path {
  stroke: var(--acx-primary-white);
}
`
export const ListSolidIcon = styled(ListSolid)`
display: 'inline';
alignItems: 'center';
margin-top: 2px;
path {
  stroke: var(--acx-primary-black);
}
`
export const LineChartIcon = styled(LineChartOutline1)`
display: 'inline';
alignItems: 'center';
path {
  stroke: var(--acx-primary-white);
}
`
export const LineChartSolidIcon = styled(LineChartSolid1)`
display: 'inline';
alignItems: 'center';
margin-top: 2px;
path {
  stroke: var(--acx-primary-black);
}
`
export const MeshIcon = styled(Mesh)`
display: 'inline';
alignItems: 'center';
height: 100%;
`
export const MeshSolidIcon = styled(MeshSolid)`
display: 'inline';
alignItems: 'center';
margin-top: 2px;
path {
  stroke: var(--acx-primary-black);
}
`

export const ArrowCornerIcon = styled(ArrowCorner)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    stroke: var(--acx-accents-blue-50);
  }
`

export const ApSingleIcon = styled(ApSingle)`
  width: 20px;
  height: 20px;
  vertical-align: text-top;
  path {
    stroke: var(--acx-accents-blue-50);
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
    stroke: var(--acx-accents-blue-50);
  }
`

export const WhiteButton = styled(Button)`
  margin-top: 0;
  svg path{
    stroke: var(--acx-primary-white);
  }
`