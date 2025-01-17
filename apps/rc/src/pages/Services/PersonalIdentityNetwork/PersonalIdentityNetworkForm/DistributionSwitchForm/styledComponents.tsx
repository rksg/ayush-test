import { Typography } from 'antd'
import styled         from 'styled-components'

export const RequiredMark = styled.span`
  margin: 0 5px;
  &:before {
    color: var(--acx-accents-orange-50);
    font-size: var(--acx-body-4-font-size);
    content: '*';
  }
`

export const StyledTextParagraph = styled(Typography.Paragraph)`
  margin-top: -10px;
  font-size: var(--acx-body-4-font-size);
`