import React from 'react'

import { DefaultOptionType } from 'antd/es/cascader'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'

import { NetworkFilter, Option } from '..'

import { onApply, onCancel } from './utils'

const optionLists: Option[] = [
  {
    value: 'n1',
    label: 'SSID 1',
    isLeaf: false
  },
  {
    value: 'n2',
    label: 'SSID 2',
    isLeaf: false
  },
  {
    value: 'n3',
    label: 'SSID 3',
    isLeaf: false
  },
  {
    value: 'n4',
    label: 'SSID 4',
    isLeaf: false
  }
]

export function LazyNestedSingle () {
  const [options, setOptions] = React.useState(optionLists)

  const onChange = (_: SingleValueType, selectedOptions: DefaultOptionType[]) => {
    onApply([], selectedOptions)
  }

  const loadData = (selectedOptions: DefaultOptionType[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption['loading'] = true // load options lazily

    setTimeout(() => {
      targetOption['loading'] = false
      targetOption.children = [
        {
          label: `${targetOption.label} Dynamic 1`,
          value: 'dynamic1'
        },
        {
          label: `${targetOption.label} Dynamic 2`,
          value: 'dynamic2'
        }
      ]
      setOptions([...options])
    }, 1000)
  }

  return <NetworkFilter
    placeholder='lazy nested, single select'
    options={options}
    onApply={onApply}
    onCancel={onCancel}
    onChange={onChange}
    loadData={loadData}
  />
}