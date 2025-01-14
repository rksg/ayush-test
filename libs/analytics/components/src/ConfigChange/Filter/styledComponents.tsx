import { Space as AntSpace } from 'antd'
import styled                from 'styled-components/macro'

import {
  Cascader as AcxCascader,
  SearchInput as AcxSearchInput
} from '@acx-ui/components'

export const Wrapper = styled(AntSpace).attrs({ style: { justifyContent: 'space-between' } })`
  padding-bottom: 15px;
`

export const Space = styled(AntSpace).attrs({ size: 12 })``

export const SearchInput = styled(AcxSearchInput)`
  width: 292px;
`

export const Cascader = styled(AcxCascader)`
  width: 200px;
`
