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
    margin-bottom: 0;
  }
`

export const SearchBarDiv = styled.div`
  width: 400px;
  display: flex;
  padding-bottom: 4px;
  gap: 5px;
`

export const SearchCountDiv = styled.div`
  padding-bottom: 16px;
  display: flex;
  align-items: baseline;
`