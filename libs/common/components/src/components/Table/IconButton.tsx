import { Menu } from 'antd'

import { Button }   from '../Button'
import { Dropdown } from '../Dropdown'
import { Tooltip }  from '../Tooltip'

import { IconButtonProps } from './types'

export const IconButton = (props: IconButtonProps) => {
  const button = <Tooltip title={props?.tooltip}><Button
    icon={props.icon}
    onClick={props.onClick}
    disabled={props.disabled}
  />
  </Tooltip>

  return Boolean(props.dropdownMenu)
    ? <Dropdown
      key={'table-option-button-dropdown'}
      overlay={<Menu {...props.dropdownMenu} />}
      disabled={props.disabled}>
      {() => button}
    </Dropdown>
    : button
}
