import styled from 'styled-components/macro'

import { SearchBar } from '@acx-ui/components'

export const ClientSearchBar = styled(SearchBar)`
  width: 400px;
  input{
    width: 400px;
  }
  span{
    width: 400px;
  }
`

export const SearchBarDiv = styled.div`
  width: 400px;
  display: flex;
  padding-bottom: 4px;
  gap: 5px;
`