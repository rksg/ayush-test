import React from 'react'

import { DefaultOptionType } from 'antd/lib/cascader'

import { NetworkFilter } from '..'
import { showToast }     from '../../Toast'

const options = [
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

const helper = (val: DefaultOptionType[] | DefaultOptionType[][]) => {
  let ret = ''
  for (let i = 0; i < val.length; i++) {
    ret += JSON.stringify(val[i]) + ' '
  }
  return ret
}

const onApply = (
  event: React.MouseEvent<Element, MouseEvent>,
  selectedRadio: string[],
  selectedOptions: DefaultOptionType[] | DefaultOptionType[][]
) => { 
  event.preventDefault()
  showToast({
    type: 'success',
    content: 
      `Radio selected: ${selectedRadio ? selectedRadio : 'no radio selected'}, 
      Cascader Options Selected: ${helper(selectedOptions)}`
  })
}

const onCancel = (event: React.MouseEvent<Element, MouseEvent>) => {
  event.preventDefault()
  showToast({
    type: 'info',
    content: 'cascader successfully closed'
  })
}

export function withRadio () {
  return <NetworkFilter
    multiple
    placeholder='With Radio'
    withRadio={{ radioTitle: 'Radio', radioOptions: ['6 GHz', '5 Ghz', '2.4 Ghz'] }}
    options={options}
    onApply={onApply}
    onCancel={onCancel}
    allowClear
  />
}