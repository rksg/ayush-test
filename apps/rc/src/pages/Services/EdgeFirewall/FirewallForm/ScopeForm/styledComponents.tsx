import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const StyledFWInfoText = styled(Typography.Text)`
  display: block;
  text-align: center;
  & span {
    color: var(--acx-accents-blue-50);
    padding: 0 5px;
  }
`