import styled from 'styled-components'

import { InformationSolid } from '@acx-ui/icons'

export const InfoIcon = styled(InformationSolid)`
path {
  fill: var(--acx-neutrals-50);
  stroke: var(--acx-primary-white) !important;
}
margin-left: 0px !important;
display: block;
`

export const Description = styled.span`
color: var(--acx-neutrals-60);
font-size: var(--acx-body-4-font-size);
`
