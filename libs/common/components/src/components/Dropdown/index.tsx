import React, { MutableRefObject, useState } from 'react'

import {
  DatePicker,
  DropdownProps as AntDropdownProps,
  MenuProps as AntMenuProps,
  Form,
  DatePickerProps
} from 'antd'
import moment,{ Moment } from 'moment-timezone'
import { MenuItemType }  from 'rc-menu/lib/interface'
import {
  useIntl
} from 'react-intl'


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
  disabledDate?:((date: moment.Moment) => boolean)
  onchange: DatePickerProps['onChange']
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

function getDisabledTime (dateSelected: Moment | null) {
  console.log(moment())
  console.log(dateSelected)
  if (dateSelected === null || !dateSelected.startOf('day').isSame(moment().startOf('day'))) {
    return 0
  }
  const result = roundUpTimeToNearest15Minutes(
    moment().format('HH:mm:ss'))
  return result

}

export const DateTimeDropdown = (
  {
    name,
    dateLabel,
    timeLabel,
    initialDate,
    disabledDate,
    onchange
  } : DateTimeDropdownProps) => {
  const [date, setDate] = useState(() => initialDate)
  const { $t } = useIntl()
  return (
    <>
      <Form.Item name={[name, 'date']}
        label={dateLabel}
        valuePropName={'date'}
        rules={[{ required: true, message: $t({ defaultMessage: 'Please enter date' }) }]}
        children={
          <DatePicker
            data-testid='selectDate'
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
              { disabledStrictlyBefore: getDisabledTime(date) }
            }
          />
        }
      />
    </>
  )
}