import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { Card }         from '@acx-ui/components'
import { BulbOutlined } from '@acx-ui/icons'

export const BulbOutlinedIcon = styled(BulbOutlined)`
  width: 24px;
  height: 24px;
  margin-top: 2px;
`

export const Title = styled(Typography.Title).attrs({ level: 2 })``

export const Subtitle = styled(Card.Title)`
  margin-block-end: 1em;
`

export const Wrapper = styled.section`
  width: 100%;
  ol {
    padding: 0;
    margin-bottom: 0;
  }
  li {
    list-style-position: inside;
    margin-block-end: 1em;
  }
`
