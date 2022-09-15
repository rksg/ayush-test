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
path {
  stroke: var(--acx-primary-white);
}
`
export const ListSolidIcon = styled(ListSolid)`
path {
  stroke: var(--acx-primary-black);
}
`
export const LineChartIcon = styled(LineChartOutline1)`
path {
  stroke: var(--acx-primary-white);
}
`
export const LineChartSolidIcon = styled(LineChartSolid1)`
path {
  stroke: var(--acx-primary-black);
}
`
export const MeshIcon = styled(Mesh)`
path {
  fill: var(--acx-primary-white);
  stroke: var(--acx-primary-white);
}
`
export const MeshSolidIcon = styled(MeshSolid)`
path {
  stroke: var(--acx-primary-black);
}
`
