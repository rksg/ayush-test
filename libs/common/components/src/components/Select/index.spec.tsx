import '@testing-library/jest-dom'
import { render }       from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import { Select } from '.'

const defaultProps = {
  style: { minWidth: 200 },
  placeholder: 'Select...'
}

const defaultOption = [
  { label: 'option 1', value: 1 },
  { label: 'option 2', value: 2 },
  { label: 'option 3', value: 3 }
]

const defaultGroupOption = [{
  label: 'option 1',
  value: 1
},{
  label: 'option 2',
  value: 2
}, {
  label: 'Group 1',
  options: [
    { label: 'option 3', value: 3 },
    { label: 'option 4', value: 4 },
    { label: 'option 5', value: 5 }
  ]
}]

const normalGroupOption = [{
  label: 'Group 1',
  options: [
    { label: 'option 1', value: 1 },
    { label: 'option 2', value: 2 }
  ]
},{
  label: 'Group 2',
  options: [
    { label: 'option 3', value: 3 },
    { label: 'option 4', value: 4 },
    { label: 'option 5', value: 5 }
  ]
}]

describe('Select', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <IntlProvider locale='en'>
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
          options={defaultGroupOption}
        />
        <Select
          {...defaultProps}
        >
          <Select.OptGroup
            key='group1'
            label='Group 1'
            children={defaultOption?.map(option => <Select.Option
              key={option.value}
              value={option.value}
              children={option.label}
            />)}
          />
          <Select.OptGroup
            key='group2'
            label='Group 2'
            children={
              defaultOption?.map(option => <Select.Option
                key={option.value * 4}
                value={option.value * 4}
                children={option.label}
              />)}
          />
        </Select>
      </IntlProvider>)
    expect(asFragment()).toMatchSnapshot()
  })
})
