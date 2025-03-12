import { Space as AntSpace } from 'antd'
import styled                from 'styled-components/macro'

import {
  Cascader as AcxCascader,
  SearchInput as AcxSearchInput
} from '@acx-ui/components'

export const Wrapper = styled(AntSpace)
  .attrs({ style: { justifyContent: 'space-between' } })<{ $offsetTop: number }>`
    padding-bottom: 15px;
    position: sticky;
    top: ${props => props.$offsetTop}px;
    z-index: 6;
    background: var(--acx-primary-white);
  `

export const Space = styled(AntSpace).attrs({ size: 12 })``

export const SearchInput = styled(AcxSearchInput).attrs({ style: { width: '292px' } })``

export const Cascader = styled(AcxCascader).attrs({ style: { width: '200px' } })``
