import { Menu as AntMenu, Dropdown as AntDropdown } from 'antd'
import styled                                       from 'styled-components/macro'

import { ArrowExpand } from '@acx-ui/icons'

const { Item } = AntMenu

export const ArrowExpandIcon = styled(ArrowExpand)`
  path {
    stroke: var(--acx-primary-white);
  }
  vertical-align: text-top;
  cursor: pointer;
`

export const Menu = styled(AntMenu)`
  background-color: var(--acx-primary-black);
  color: var(--acx-primary-white);
`

export const MenuItem = styled(Item)`
  background-color: var(--acx-primary-black);
  color: var(--acx-primary-white);
`

export const Dropdown = styled(AntDropdown)`
  background-color: var(--acx-primary-black);
  color: var(--acx-primary-white);
`

export const DropDownContainer = styled.div`
  margin: 0px 5px;
  display: inline-block;
  font-size: 14px;
`
