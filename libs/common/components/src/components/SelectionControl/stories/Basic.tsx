import { SelectionControl } from '..'

const options = [
  { value: 'value1', label: 'label - 1' },
  { value: 'value2', label: 'label - 2' },
  { value: 'value3', label: 'label - 3' },
  { value: 'value4', label: 'label - 4' },
  { value: 'value5', label: 'label - 5' }
]

export function Basic () {
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
        <p>large</p>
        <SelectionControl
          size={'large'}
          options={options}
          defaultValue={options[1].value}
        />
      </div>
    </>
  )
}
