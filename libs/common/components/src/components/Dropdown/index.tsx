import React, { MutableRefObject, useState } from 'react'

import {
  DatePicker,
  DropdownProps as AntDropdownProps,
  MenuProps as AntMenuProps,
  Form,
  DatePickerProps
} from 'antd'
import { Moment }                 from 'moment-timezone'
import { MenuItemType }           from 'rc-menu/lib/interface'
import { defineMessage, useIntl } from 'react-intl'

import { ScopeKeys } from '@acx-ui/types'

import { TimeDropdown, TimeDropdownTypes } from '../TimeDropdown'

import * as UI from './styledComponents'


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
  name: string
  initialDate: Moment
  time: MutableRefObject<number>,
  disabledDate:(value: Moment) => boolean
  onchange: DatePickerProps['onChange']
}

export const DateTimeDropdown = (
  {
    name,
    initialDate,
    time,
    disabledDate,
    onchange
  } : DateTimeDropdownProps) => {
  const [date, setDate] = useState(() => initialDate)
  const { $t } = useIntl()
  return (
    <>
      <Form.Item name={['settings', 'date']}
        label={$t(defineMessage({ defaultMessage: 'Schedule Date' }))}
        valuePropName={'date'}
        children={
          <DatePicker
            style={{ width: '100%' }}
            picker='date'
            value={date}
            showTime={false}
            showToday={false}
            disabledDate={disabledDate}
            onChange={(e,i) => {
              onchange!(e,i)
              setDate(e!)
            }}
          />
        }
      />

      <Form.Item
        label={$t(defineMessage({ defaultMessage: 'Schedule Time' }))}
        children={
          <TimeDropdown type={TimeDropdownTypes.Daily} // if date is today, disable before current, else no disable
            name={name}
            disabledDateTime={
              { disabledStrictlyBefore: time.current }
            }
          />
        }
      />
    </>
  )
}