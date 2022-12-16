import styled from 'styled-components/macro'

import {
  CloseSymbol, InformationSolid
} from '@acx-ui/icons'

export const Container = styled.div`
  padding-bottom: 5px
`
export const Label = styled.div`
  height: 36px;
  padding: 12px;
  border: 1px solid var(--acx-accents-orange-25);
  background-color: var(--acx-accents-orange-10);
`
export const InformationIcon = styled(InformationSolid)`
path:nth-child(2) {
  fill: var(--acx-accents-orange-50);
  stroke: var(--acx-accents-orange-50);
}
`

export const CloseIcon = styled(CloseSymbol)`
  font-size: large;
`
