import { SelectionControl } from '..'

const options = [
  { value: 'value1', label: 'label - 1', disabled: true },
  { value: 'value2', label: 'label - 2', disabled: true },
  { value: 'value3', label: 'label - 3', disabled: true },
  { value: 'value4', label: 'label - 4', disabled: true },
  { value: 'value5', label: 'label - 5', disabled: true }
]

export function BasicWithDisabled () {
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
