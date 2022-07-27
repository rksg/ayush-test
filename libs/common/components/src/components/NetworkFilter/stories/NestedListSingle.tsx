import { NetworkFilter, Option } from '..'

import { onApply, onCancel } from './utils'

const options: Option[] = [
  {
    value: 'v1',
    label: 'Venue 1',
    children: [
      {
        value: 'v1-a',
        label: 'APs',
        children: [
          {
            value: 'v1-a-ap3',
            label: 'AP 3'
          },
          {
            value: 'v1-a-ap4',
            label: 'AP 4'
          }
        ]
      },
      {
        value: 'v1-s',
        label: 'Switches',
        children: [
          {
            value: 'v1-s-s1',
            label: 'Switch 1'
          },
          {
            value: 'v1-s-s2',
            label: 'Switch 2'
          }
        ]
      }
    ]
  },
  {
    value: 'v2',
    label: 'Venue 2',
    children: [
      {
        value: 'v2-a',
        label: 'APs',
        children: [
          {
            value: 'v2-a-ap5',
            label: 'AP 5'
          }
        ]
      }
    ]
  }
]

export function NestedListSingle () {
  return <NetworkFilter
    placeholder='nested list, single select'
    options={options}
    onApply={onApply}
    onCancel={onCancel}
  />
}