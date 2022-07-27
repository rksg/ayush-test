import { Anchor } from 'antd'
import styled     from 'styled-components/macro'

export const LeftColumn = styled(Anchor)`
  min-width: 200px;
  max-width: 300px;
  width: 100%;
  padding-right: 10px;

  .ant-anchor {
    font-weight: var(--acx-body-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
`
