import { Space as AntSpace } from 'antd'
import styled                from 'styled-components/macro'

import {
  Cascader as AcxCascader,
  SearchInput as AcxSearchInput
} from '@acx-ui/components'

export const Wrapper = styled(AntSpace)`
  justify-content: space-between;
  padding-bottom: 15px;
  position: sticky;
  top: var(--sticky-offset);
  z-index: 5;
  background-color: var(--acx-primary-white);
`

export const Space = styled(AntSpace).attrs({ size: 12 })``

export const SearchInput = styled(AcxSearchInput).attrs({ style: { width: '292px' } })``

export const Cascader = styled(AcxCascader).attrs({ style: { width: '200px' } })``
