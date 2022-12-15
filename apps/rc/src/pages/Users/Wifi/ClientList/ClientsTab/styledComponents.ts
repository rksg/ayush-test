import styled from 'styled-components/macro'

import { Anchor, SearchBar } from '@acx-ui/components'

const { Link } = Anchor

export const ClientSearchBar = styled(SearchBar)`
  width: 400px;
  input{
    width: 400px;
  }
  span{
    width: 400px;
  }
`

export const ClientLink = styled(Link)`
  .ant-anchor-link-title{
    background: none;
    border: 0;
    border-radius: 0;
    padding: 0;
  }
`