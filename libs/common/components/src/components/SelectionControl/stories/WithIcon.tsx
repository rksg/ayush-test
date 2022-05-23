import { SearchOutlined } from '@acx-ui/icons'

import { SelectionControl, SelectionControlOptionProps } from '..'

const options: SelectionControlOptionProps[] = [
  { value: 'value1', label: 'label - 1', icon: <SearchOutlined /> },
  { value: 'value2', label: 'label - 2', icon: <SearchOutlined /> },
  { value: 'value3', label: 'label - 3', icon: <SearchOutlined /> },
  { value: 'value4', label: 'label - 4', icon: <SearchOutlined /> },
  { value: 'value5', label: 'label - 5', icon: <SearchOutlined /> }
]

export function WithIcon () {
  return (
    <>
      <div style={{ height: '70px' }}>
        <p>small</p>
        <SelectionControl
          size={'small'}
          options={options}
          defaultValue={options[0].value}
        />
      </div>
      <div style={{ height: '70px' }}>
        <p>middle</p>
        <SelectionControl
          size={'middle'}
          options={options}
          defaultValue={options[1].value}
        />
      </div>
      <div style={{ height: '70px' }}>
        <p>large</p>
        <SelectionControl
          size={'large'}
          options={options}
          defaultValue={options[2].value}
        />
      </div>
    </>
  )
}
