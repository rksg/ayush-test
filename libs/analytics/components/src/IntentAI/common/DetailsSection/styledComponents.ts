import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const Wrapper = styled.div`
  margin-block-end: 40px;
  display: flex;
  flex-direction: column;
  flex: 1;
`

export const Title = styled(Typography.Title).attrs({ level: 4 })`
  &&& {
    font-weight: var(--acx-headline-4-font-weight-bold);
  }
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
