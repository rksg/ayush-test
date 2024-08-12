import React, { MutableRefObject, useState } from 'react'

import {
  DatePicker,
  DropdownProps as AntDropdownProps,
  MenuProps as AntMenuProps,
  Form,
  DatePickerProps,
  FormInstance
} from 'antd'
import moment,{ Moment } from 'moment-timezone'
import { MenuItemType }  from 'rc-menu/lib/interface'

import { ScopeKeys } from '@acx-ui/types'

import { TimeDropdown } from '../TimeDropdown'

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
  dateLabel: string
  timeLabel: string
  initialDate: Moment
  time: MutableRefObject<number>,
  disabledDate:(value: Moment) => boolean
  onchange: DatePickerProps['onChange']
  form: FormInstance
}

function roundUpTimeToNearest15Minutes (timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15
  const roundedHours = Math.floor(roundedMinutes / 60)
  const roundedMinutesInHour = roundedMinutes % 60
  const decimalHour = roundedHours + roundedMinutesInHour / 60
  return decimalHour
}

function getDisabledTime (dateSelected: Moment) {
  if (dateSelected.startOf('day').isSame(moment().startOf('day'))) {
    const result = roundUpTimeToNearest15Minutes(
      moment().format('HH:mm:ss'))
    return result
  }
  return 0
}
export const DateTimeDropdown = (
  {
    name,
    dateLabel,
    timeLabel,
    initialDate,
    disabledDate,
    onchange,
    form
  } : DateTimeDropdownProps) => {
  const [date, setDate] = useState(() => initialDate)
  const dateSelected: Moment = form.getFieldValue([name, 'date'])
  return (
    <>
      <Form.Item name={[name, 'date']}
        label={dateLabel}
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
        label={timeLabel}
        children={
          <TimeDropdown name={name}
            spanLength={24}
            disabledDateTime={
              { disabledStrictlyBefore: getDisabledTime(dateSelected) }
            }
          />
        }
      />
    </>
  )
}