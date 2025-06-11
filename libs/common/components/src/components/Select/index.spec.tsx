import '@testing-library/jest-dom'
import { IntlProvider } from 'react-intl'

import { render } from '@acx-ui/test-utils'

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
    { label: 'option 3', value: 3, disabled: true },
    { label: 'option 4', value: 4 },
    { label: 'option 5', value: 5 }
  ]
}]

const normalGroupOption = [{
  label: 'Group 1',
  options: [
    { label: 'option 1', value: 1, disabled: true },
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
        {/* Group - Single Select */}
        <Select
          {...defaultProps}
          options={normalGroupOption}
        />
        {/* Group - Single Select (radio type) */}
        <Select
          {...defaultProps}
          type='radio'
          options={defaultGroupOption}
        />
        {/* Group - Multiple Select */}
        <Select
          {...defaultProps}
          mode='multiple'
          options={defaultGroupOption}
        />
        <Select
          {...defaultProps}
          mode='multiple'
          options={normalGroupOption}
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
              disabled={option.value===1}
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

describe('Select.getPopupContainer', () => {
  it('returns parent element if triggerNode has parent with class .ant-select-selector', () => {
    const triggerNode = document.createElement('div')
    const parentElement = document.createElement('div')
    parentElement.classList.add('ant-select-selector')
    parentElement.appendChild(triggerNode)
    document.body.appendChild(parentElement)
    const result = Select.getPopupContainer(triggerNode)
    expect(result).toBe(parentElement)
  })

  it('returns parent element if triggerNode has class .ant-select-selector', () => {
    const triggerNode = document.createElement('div')
    triggerNode.classList.add('ant-select-selector')
    const parentElement = document.createElement('div')
    parentElement.appendChild(triggerNode)
    document.body.appendChild(parentElement)
    const result = Select.getPopupContainer(triggerNode)
    expect(result).toBe(parentElement)
  })

  // eslint-disable-next-line max-len
  it('returns document.body if triggerNode has class .ant-select-selector but parent element is null', () => {
    const triggerNode = document.createElement('div')
    triggerNode.classList.add('ant-select-selector')
    const result = Select.getPopupContainer(triggerNode)
    expect(result).toBe(document.body)
  })

  it('returns document.body if triggerNode is undefined', () => {
    const result = Select.getPopupContainer(undefined)
    expect(result).toBe(document.body)
  })
})