import { Anchor } from 'antd'
import styled     from 'styled-components/macro'

export const LeftColumn = styled(Anchor)`
  padding-right: 10px;

  .ant-anchor {
    font-weight: var(--acx-body-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);

    .ant-anchor-ink {
      visibility: hidden;
    }
  }
`
