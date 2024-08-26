import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const Wrapper = styled.div`
  margin-block-end: 40px;
`

export const Title = styled(Typography.Title).attrs({ level: 4 })`
  &&& {
    font-weight: var(--acx-headline-4-font-weight-bold);
  }
`
