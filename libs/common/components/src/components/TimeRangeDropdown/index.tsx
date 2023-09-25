import React, { createContext, useContext, useState } from 'react'

import { Menu, Space } from 'antd'
import { ItemType }    from 'antd/lib/menu/hooks/useItems'
import { useIntl }     from 'react-intl'

import { DateRange, dateRangeMap, defaultRanges } from '@acx-ui/utils'

import { Dropdown, Button, CaretDownSolidIcon } from '../..'

import type { Moment } from 'moment'

interface TimeRangeDropDownContextType {
  availableRanges: DateRange[]
  timeRange: Moment[]
  selectedRange: DateRange
  setTimeRangeDropDownRange: React.Dispatch<React.SetStateAction<DateRange>>
}

export const defaultTimeRangeDropDownContextValue: TimeRangeDropDownContextType = {
  availableRanges: [DateRange.last24Hours],
  timeRange: defaultRanges()[DateRange.last24Hours]!,
  selectedRange: DateRange.last24Hours,
  setTimeRangeDropDownRange: () => {}
}

const TimeRangeDropDownContext = createContext<TimeRangeDropDownContextType>(
  defaultTimeRangeDropDownContextValue
)

export const useDateRange = () => {
  const context = useContext(TimeRangeDropDownContext)
  return context
}

interface TimeRangeDropDownProviderProps {
  availableRanges: DateRange[]
  children: React.ReactNode
}


export const TimeRangeDropDownProvider: React.FC<TimeRangeDropDownProviderProps> = ({
  availableRanges,
  children
}) => {
  const [selectedRange, setTimeRangeDropDownRange] = useState<DateRange>(
    availableRanges[0]
  )
  const timeRange = defaultRanges()[selectedRange]!
  return (
    <TimeRangeDropDownContext.Provider
      value={{ availableRanges, timeRange, selectedRange, setTimeRangeDropDownRange }}>
      {children}
    </TimeRangeDropDownContext.Provider>
  )
}

export const TimeRangeDropDown: React.FC = () => {
  const { $t } = useIntl()
  const { availableRanges, selectedRange, setTimeRangeDropDownRange } = useDateRange()
  return (
    <Dropdown
      key='timerange-dropdown'
      overlay={
        <Menu
          onClick={(e) => setTimeRangeDropDownRange(e.key as DateRange)}
          items={
            availableRanges.map((key) => ({
              key,
              label: $t(dateRangeMap[key])
            })) as ItemType[]
          }
        />
      }>
      {() => (
        <Button>
          <Space>
            {selectedRange}
            <CaretDownSolidIcon />
          </Space>
        </Button>
      )}
    </Dropdown>
  )
}
