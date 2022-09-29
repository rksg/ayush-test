import { Button } from 'antd'
import styled     from 'styled-components/macro'


import {
  List,
  ListSolid,
  LineChartOutline1,
  LineChartSolid1,
  Mesh,
  MeshSolid
} from '@acx-ui/icons'

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
export const IconWrapper = styled.div`
  .icon-arrow-corner:before {
    font-size: 14px;
    vertical-align: middle;
    padding-right: 3px;
  }
  .icon-ap-single:before {
    font-size: 18px;
    vertical-align: middle;
    padding-right: 3px;
  }
  .icon-wired:before {
    font-size: 18px;
    vertical-align: middle;
    padding-right: 3px;
  }
  .icon-signal-down:before {
    font-size: 18px;
    vertical-align: middle;
    padding-right: 3px;
  }
  .icon-wlan:before {
    font-size: 18px;
    vertical-align: middle;
    padding-right: 3px;
  }
`
export const WhiteButton = styled(Button)`
  margin-top: 0;
  svg path{
    stroke: var(--acx-primary-white);
  }
`