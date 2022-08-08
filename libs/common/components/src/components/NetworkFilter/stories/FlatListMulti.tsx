import { NetworkFilter, Option } from '..'

import { onApply, onCancel } from './utils'

const options: Option[] = [
  {
    value: 'n1',
    label: 'SSID 1'
  },
  {
    value: 'n2',
    label: 'SSID 2'
  },
  {
    value: 'n3',
    label: 'SSID 3'
  },
  {
    value: 'n4',
    label: 'SSID 4'
  },
  {
    value: 'n5',
    label: 'SSID 5'
  },
  {
    value: 'n6',
    label: 'SSID 7'
  }
]

export function FlatListMulti () {
  return <NetworkFilter
    multiple
    placeholder='flat list, multi-select'
    options={options}
    onApply={onApply}
    onCancel={onCancel}
  />
}