import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Select } from '.'

const defaultProps = {
  style: { minWidth: 200 },
  placeholder: 'Select...'
}

const defaultOption = [
  { label: 'option 1', value: '1' },
  { label: 'option 2', value: '2' },
  { label: 'option 3', value: '3' }
]

const defaultGroupOption = [{
  label: 'Default',
  options: [
    { label: 'option 1', value: '1' },
    { label: 'option 2', value: '2' }
  ]
},{
  label: 'Group 1',
  options: [
    { label: 'option 3', value: '3' },
    { label: 'option 4', value: '4' },
    { label: 'option 5', value: '5' }
  ]
}]

const normalGroupOption = [{
  label: 'Group 1',
  options: [
    { label: 'option 1', value: '1' },
    { label: 'option 2', value: '2' }
  ]
},{
  label: 'Group 2',
  options: [
    { label: 'option 3', value: '3' },
    { label: 'option 4', value: '4' },
    { label: 'option 5', value: '5' }
  ]
}]

describe('Select', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <>
        <Select
          {...defaultProps}
          options={defaultOption}
        />
        <Select
          {...defaultProps}
          options={normalGroupOption}
        />
        <Select
          {...defaultProps}
          mode='multiple'
          hasDefaultGroup
          options={defaultGroupOption}
        />
      </>)
    expect(asFragment()).toMatchSnapshot()
  })
})
