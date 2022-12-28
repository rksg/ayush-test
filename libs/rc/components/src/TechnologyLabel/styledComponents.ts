import styled, { css } from 'styled-components/macro'

import { ServiceTechnology } from '@acx-ui/rc/utils'

const styleMap = {
  [ServiceTechnology.WIFI]: css`background-color: var(--acx-accents-blue-60);`,
  [ServiceTechnology.SWITCH]: css`background-color: var(--acx-semantics-green-60);`
}

export const TechnologyContainer = styled.div`
  margin-top: 8px;
`
export const TechnologyItem = styled.div<{ $type: ServiceTechnology }>`
  color: var(--acx-neutrals-10);
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  ${props => styleMap[props.$type]}
`
