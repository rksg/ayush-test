import styled from 'styled-components/macro'

import { Button } from '@acx-ui/components'

export const AlertText = styled.div`
  min-height: 35px;

  & span {
    color: var(--acx-semantics-red-50);
    font-size: var(--acx-body-4-font-size);
  }
`

export const LinkButton = styled(Button)`
  vertical-align: inherit;
  & span {
    color: inherit;
  }
`

export const Diagram = styled.img`
  width: 220px;
  margin-top: 40px;
`