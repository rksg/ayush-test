import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { Card }         from '@acx-ui/components'
import { BulbOutlined } from '@acx-ui/icons'

import { withUrlStyle } from '../../DescriptionSection/styledComponents'

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
  ol, ul {
    padding-inline-start: 1em;
  }
  li {
    margin-block-end: 1em;
    &:last-of-type { margin-block-end: 0; }
  }
`

export const DrawerTextContent = styled.div`
  display: inline-block;
  ${withUrlStyle}
`
