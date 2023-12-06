import { storiesOf } from '@storybook/react'
import { Space }     from 'antd'

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

storiesOf('Select', module)
  .add('Basic', () => {
    return <Select
      {...defaultProps}
      options={defaultOption}
    />
  })
  .add('Within optional field', () => {
    return <>
      <p>*need a empty option to reset value</p>
      <Select
        {...defaultProps}
        options={[
          { label: 'Select...', value: '' },
          ...defaultOption
        ]}
      />
    </>
  })
  .add('Normal Option Group', () => {
    return <Space>
      <div>
        <p>Single:</p>
        <Select
          {...defaultProps}
          options={normalGroupOption}
        />
      </div>
      <div>
        <p>Multiple:</p>
        <Select
          {...defaultProps}
          mode='multiple'
          options={normalGroupOption}
        />
      </div>
    </Space>
  })
  .add('Default Option Group', () => {
    return <Space>
      <div>
        <p>Single:</p>
        <Select
          {...defaultProps}
          hasDefaultGroup
          options={defaultGroupOption}
        />
      </div>
      <div>
        <p>Multiple:</p>
        <Select
          {...defaultProps}
          mode='multiple'
          hasDefaultGroup
          options={defaultGroupOption}
        />
      </div>
    </Space>
  })
