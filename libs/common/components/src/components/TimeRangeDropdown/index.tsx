import React, { createContext, useContext, useState } from 'react'

import { Menu, Space } from 'antd'
import { ItemType }    from 'antd/lib/menu/hooks/useItems'
import moment          from 'moment'
import { useIntl }     from 'react-intl'

import { getUserProfile, isCoreTier }                                                        from '@acx-ui/user'
import { DateRange, dateRangeMap, defaultCoreTierRanges, defaultRanges, trackDateSelection } from '@acx-ui/utils'

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
  timeRange: [moment(), moment()],
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
  defaultSelectedRange?: DateRange
  /**
   * Additional default time ranges that override the standard defaults for this TimeRangeDropdown context only.
   * This parameter allows customizing time ranges specifically for this dropdown instance without affecting
   * other date range functionality throughout the application.
   */
  additionalDefaultTimeRanges?: Partial<{ [key in DateRange]: moment.Moment[] }>
  children: React.ReactNode
}

export const TimeRangeDropDownProvider: React.FC<TimeRangeDropDownProviderProps> = ({
  availableRanges,
  defaultSelectedRange,
  additionalDefaultTimeRanges,
  children
}) => {
  const [selectedRange, setTimeRangeDropDownRange] = useState<DateRange>(
    defaultSelectedRange ?? availableRanges[0]
  )
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const defaultTimeRanges = isCore ? defaultCoreTierRanges() : defaultRanges()
  const timeRange = { ...defaultTimeRanges, ...additionalDefaultTimeRanges }[selectedRange]!
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
          onClick={(e) => {
            const key = e.key as DateRange
            setTimeRangeDropDownRange(key)
            trackDateSelection(key)
          }}
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
