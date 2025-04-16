import styled from 'styled-components/macro'

import { Card } from '@acx-ui/components'

export const Wrapper = styled.div`
  margin-block-end: 40px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

export const Title = styled(Card.Title)`
  margin-block-end: 0.5em;
  svg {
    vertical-align: text-top;
    margin-inline: 3px;
  }
`

export const Details = styled.div`
  flex: 1;
  ul {
    padding-inline-start: 15px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`
