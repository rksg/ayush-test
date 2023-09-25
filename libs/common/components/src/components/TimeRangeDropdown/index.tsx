import React, { createContext, useContext, useState } from 'react'

import { Menu, Space, MenuProps } from 'antd'
import { ItemType }               from 'antd/lib/menu/hooks/useItems'
import { useIntl }                from 'react-intl'

import { DateRange, dateRangeMap } from '@acx-ui/utils'

import { Dropdown, Button, CaretDownSolidIcon } from '../..'

interface TimeRangeDropDownContextType {
  timeRangeDropDownRange: DateRange;
  setTimeRangeDropDownRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

interface TimeRangeDropDownProviderProps {
  children: React.ReactNode;
}

export const defaultTimeRangeDropDownContextValue: TimeRangeDropDownContextType = {
  timeRangeDropDownRange: DateRange.last24Hours,
  setTimeRangeDropDownRange: () => {}
}

const TimeRangeDropDownContext = createContext<TimeRangeDropDownContextType>(
  defaultTimeRangeDropDownContextValue
)

export const useDateRange = () => {
  const context = useContext(TimeRangeDropDownContext)
  return context
}

export const TimeRangeDropDownProvider: React.FC<TimeRangeDropDownProviderProps> = ({
  children
}) => {
  const [timeRangeDropDownRange, setTimeRangeDropDownRange] = useState<DateRange>(
    DateRange.last24Hours
  )
  return (
    <TimeRangeDropDownContext.Provider
      value={{ timeRangeDropDownRange, setTimeRangeDropDownRange }}>
      {children}
    </TimeRangeDropDownContext.Provider>
  )
}

export const TimeRangeDropDown: React.FC = () => {
  const { $t } = useIntl()
  const { timeRangeDropDownRange, setTimeRangeDropDownRange } = useDateRange()

  const handleClick: MenuProps['onClick'] = (e) => {
    setTimeRangeDropDownRange(e.key as DateRange)
  }

  return (
    <Dropdown
      key='timerange-dropdown'
      overlay={
        <Menu
          onClick={handleClick}
          items={
            [DateRange.last24Hours, DateRange.last7Days, DateRange.last30Days].map((key) => ({
              key,
              label: $t(dateRangeMap[key])
            })) as ItemType[]
          }
        />
      }>
      {() => (
        <Button>
          <Space>
            {timeRangeDropDownRange}
            <CaretDownSolidIcon />
          </Space>
        </Button>
      )}
    </Dropdown>
  )
}
