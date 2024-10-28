import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const StyledText = styled.span`
  &::after {
    color: var(--acx-accents-orange-50);
    font-family: var(--acx-neutral-brand-font);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    content: '*';
    margin-left: 3px;
  }
`


export const StyledSubText = styled(Typography.Text)`
  font-size: var(--acx-body-4-font-size);
`