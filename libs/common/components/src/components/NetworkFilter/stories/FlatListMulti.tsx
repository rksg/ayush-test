import { NetworkFilter, Option } from '..'

import { onApply } from './utils'

const options: Option[] = [
  {
    value: 'n1',
    label: 'Venue 1'
  },
  {
    value: 'n2',
    label: 'Venue 2'
  },
  {
    value: 'n3',
    label: 'Venue 3'
  },
  {
    value: 'n4',
    label: 'Venue 4'
  },
  {
    value: 'n5',
    label: 'Venue 5'
  },
  {
    value: 'n6',
    label: 'Venue 6'
  }
]

export function FlatListMulti () {
  return <div style={{ width: 300 }}>
    <NetworkFilter
      multiple
      defaultValue={[['n3'], ['n6']]}
      placeholder='Entire Organization'
      options={options}
      onApply={onApply}
    />
  </div>
}
