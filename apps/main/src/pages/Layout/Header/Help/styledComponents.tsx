import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { Subtitle } from '@acx-ui/components'

export const Description = styled.div`
  color: var(--acx-neutrals-70);
  margin-top: 4px;
  font-size: var(--acx-subtitle-5-font-size);
`

export const HelpSubtitle = styled(Subtitle).attrs({ level: 5 })`
  font-weight: var('--acx-subtitle-5-font-weight-semi-bold');
`

type CopyableTextProps = {
  color?: string
}
export const CopyableText = styled(Typography.Paragraph)
  .attrs({ copyable: true })<CopyableTextProps>`
  margin-bottom: 3px !important;
  color: ${(props) => (props.color ? props.color : 'var(--acx-accents-blue-50)')};
`
