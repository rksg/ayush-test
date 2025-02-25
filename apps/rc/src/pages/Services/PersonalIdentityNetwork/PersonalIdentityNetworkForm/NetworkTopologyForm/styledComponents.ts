import { Typography } from 'antd'
import styled         from 'styled-components'

export const TopologySelectCardTitle = styled(Typography.Text)`
  z-index: 1;
  position: relative;
  bottom: -35px;
  left: 15px;
  font-size: var(--acx-subtitle-4-font-size);

  & strong {
    font-weight: bold;
  }
`