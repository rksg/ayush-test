import React, { MutableRefObject, useState } from 'react'

import {
  DatePicker,
  DropdownProps as AntDropdownProps,
  MenuProps as AntMenuProps
} from 'antd'
import { Moment }       from 'moment-timezone'
import { MenuItemType } from 'rc-menu/lib/interface'

import { ScopeKeys } from '@acx-ui/types'

import * as UI from './styledComponents'

// import { DatePicker, TimeDropdown, TimeDropdownTypes } from '@acx-ui/components'

export interface DropdownProps extends Omit<AntDropdownProps, 'overlay' | 'trigger' | 'children'> {
  overlay: React.ReactElement<AntMenuProps>
  scopeKey?: ScopeKeys,
  children: (selectedKeys: string | null) => React.ReactElement
}

export interface DropdownItemType extends MenuItemType {
  scopeKey?: ScopeKeys,
  allowedOperationUrl?: string
}

export function Dropdown ({ overlay, children, scopeKey, ...props }: DropdownProps) {
  const { defaultSelectedKeys, onClick } = overlay.props
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(defaultSelectedKeys)
  const transformedOverlay = {
    ...overlay,
    props: {
      ...overlay.props,
      items: (overlay?.props?.items as DropdownItemType[])?.map(item => {
        const itemProps = item ?? {}
        const { scopeKey, allowedOperationUrl, ...props } = itemProps
        return props
      })
    }
  }
  const menu = React.cloneElement(transformedOverlay, {
    onClick: ((event) => {
      onClick && onClick(event)
      setSelectedKeys([event.key])
    }) as AntMenuProps['onClick']
  })
  return <UI.Dropdown
    overlay={menu}
    trigger={['click']}
    {...props}
  >{children && children!(selectedKeys ? selectedKeys.join(', ') : null)}</UI.Dropdown>
}

Dropdown.MenuItemWithIcon = UI.MenuItemWithIcon
Dropdown.OverlayContainer = UI.OverlayContainer
Dropdown.OverlayTitle = UI.OverlayTitle

interface DateTimeDropdownProps {
  // extraFooter?: ReactNode;
  // disabled?: boolean;
  // icon?: ReactNode;
  initialDate: MutableRefObject<Moment>
  // onApply: (value: Moment) => void;
  // title?: string;
  disabledDateTime?: {
    disabledDate?: (value: Moment) => boolean,
    disabledHours?: (value: Moment) => number[],
    disabledMinutes?: (value: Moment) => number[],
  }
}

export function DateTimeDropdown (
  {
    initialDate,
    disabledDateTime
  } : DateTimeDropdownProps) {
  const { disabledDate, disabledHours, disabledMinutes } = disabledDateTime || {}
  const [date, setDate] = useState(() => initialDate.current)
  return (
    <DatePicker
      // open={true}
      // // className='hidden-date-input'
      // // dropdownClassName='hidden-date-input-popover'
      // picker='date'
      // value={date}
      // // disabled={disabled}
      // // value={date}
      // // open={open}
      // // onClick={() => setOpen(true)}
      // showTime={false}
      // showNow={false}
      // showToday={false}
      // disabledDate={disabledDate}
      renderExtraFooter={
        () => 'yo'}
    />
  )}