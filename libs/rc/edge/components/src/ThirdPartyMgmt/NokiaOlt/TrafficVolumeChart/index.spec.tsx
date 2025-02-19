import React from 'react'

import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { EdgeOltFixtures, EdgeNokiaCageStateEnum } from '@acx-ui/rc/utils'
import { render, screen }                          from '@acx-ui/test-utils'

import { EdgeOltTrafficByVolumeWidget } from './index'

const { mockOltCageList } = EdgeOltFixtures

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  dropdownClassName?: string
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options,
    dropdownClassName, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {children ? children : null}
      {options?.map((option) => (
        <option
          key={`option-${option.value}`}
          value={option.value as string}>
          {option.label}
        </option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  MultiLineTimeSeriesChart: () => <div data-testid='MultiLineTimeSeriesChart'>
    MultiLineTimeSeriesChart
  </div>
}))
describe('EdgeOltTrafficByVolumeWidget', () => {

  it('renders chart correctly', async () => {
    render(<EdgeOltTrafficByVolumeWidget
      cages={mockOltCageList}
      isLoading={false}
    />)
    await screen.findByText('Traffic by Volume')
    const chart = screen.getByText('MultiLineTimeSeriesChart')
    expect(chart).toBeInTheDocument()
  })

  it('should correctly render loading icon', async () => {
    render(<EdgeOltTrafficByVolumeWidget
      cages={mockOltCageList}
      isLoading={true}
    />)
    screen.getByRole('img', { name: 'loader' })
    expect(screen.queryByText('Traffic by Volume')).toBeNull()
  })

  it('renders chart series with the selected data type', async () => {
    const mockData = cloneDeep(mockOltCageList)
    mockData.forEach((cage, idx) => {
      if (cage.cage === 'S1/6') {
        mockData[idx].state = EdgeNokiaCageStateEnum.UP
      }
    })

    render(<EdgeOltTrafficByVolumeWidget
      cages={mockData}
      isLoading={false}
    />)
    await screen.findByText('Traffic by Volume')
    const chart = screen.getByText('MultiLineTimeSeriesChart')
    expect(chart).toBeInTheDocument()

    const selector = screen.getByRole('combobox')
    await userEvent.selectOptions(
      selector,
      await screen.findByRole('option', { name: 'S1/6' })
    )
    await screen.findByText('S1/6')
  })
})