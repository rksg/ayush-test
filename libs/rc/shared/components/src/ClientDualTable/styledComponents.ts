import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Anchor } from '@acx-ui/components'

const { Link } = Anchor

export const ClientLink = styled(Link)`
  &.ant-anchor-link {
    padding: 0;
    .ant-anchor-link-title{
      color: var(--acx-accents-blue-50);
      &:hover {
        color: var(--acx-accents-blue-60);
      }
    }
  }
  &.ant-anchor-link-active {
    .ant-anchor-link-title{
      color: var(--acx-accents-blue-50);
    }
  }
`

export const SearchBarDiv = styled(Space).attrs({ size: 5 })`
  padding-bottom: 4px;
`

export const SearchCountDiv = styled.div`
  padding-bottom: 16px;
  display: flex;
  align-items: baseline;
`
