import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const DiagramContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 20px;
  display: block;
  text-align: center;

  & img {
    width: 290px;
  }
`

export const StyledParagraph = styled(Typography.Paragraph)`
  line-height: var(--acx-body-3-line-height);
`