import styled from 'styled-components/macro'

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
margin-top: 2px;
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
margin-top: 2px;
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
margin-top: 2px;
path {
  fill: var(--acx-primary-white);
  stroke: var(--acx-primary-white);
}
`
export const MeshSolidIcon = styled(MeshSolid)`
display: 'inline';
alignItems: 'center';
margin-top: 2px;
path {
  stroke: var(--acx-primary-black);
}
`
