import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { Subtitle } from '@acx-ui/components'


export const EmptyDescription = styled.span`
  color: var(--acx-neutrals-40);
`

export const HelpSubtitle = styled(Subtitle).attrs({ level: 5 })`
  font-weight: var(--acx-subtitle-5-font-weight-semi-bold)!important;
`

type CopyableTextProps = {
  color?: string
}
export const CopyableText = styled(Typography.Link)
  .attrs({ copyable: true })<CopyableTextProps>`
  margin-bottom: 3px !important;
  display: block;
  cursor: auto !important;
  color:var(--acx-primary-black) !important;
`
