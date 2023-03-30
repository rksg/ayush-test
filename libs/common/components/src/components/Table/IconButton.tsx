import { Menu } from 'antd'

import { Button }   from '../Button'
import { Dropdown } from '../Dropdown'

import { IconButtonProps } from './types'

export const IconButton = (props: IconButtonProps) => {
  const button = <Button
    icon={props.icon}
    onClick={props.onClick}
    disabled={props.disabled}
  />

  return Boolean(props.dropdownMenu)
    ? <Dropdown
      key={'table-option-button-dropdown'}
      overlay={<Menu {...props.dropdownMenu} />}
      disabled={props.disabled}>
      {() => button}
    </Dropdown>
    : button
}
