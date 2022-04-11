import { Menu as antMenu, Dropdown as antDropdown } from 'antd'
import { ReactComponent as ArrowExpand }            from 'src/assets/icons/ArrowExpand.svg'
import styled                                       from 'styled-components/macro'

const { Item } = antMenu

export const ArrowExpandIcon = styled(ArrowExpand)`
  path {
    stroke: var(--acx-primary-white);
  }
  vertical-align: text-top;
  cursor: pointer;
`

export const Menu = styled(antMenu)`
  background-color: var(--acx-primary-black);
  color: var(--acx-primary-white);
`

export const MenuItem = styled(Item)`
  background-color: var(--acx-primary-black);
  color: var(--acx-primary-white);
`

export const Dropdown = styled(antDropdown)`
  background-color: var(--acx-primary-black);
  color: var(--acx-primary-white);
`

export const DropDownContainer = styled.div`
  margin: 0px 5px;
  display: inline-block;
  font-size: 14px;
`
