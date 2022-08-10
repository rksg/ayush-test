import React from 'react'

import { DefaultOptionType } from 'antd/es/cascader'

import { NetworkFilter, Option } from '..'

import { onApply, onCancel } from './utils'


const createNode: () => DefaultOptionType = () => {
  const isChild = Math.random() > 0.6
  return {
    label: `Node ${(Math.random() * 1e18).toString(36).slice(0, 3).toUpperCase()}`,
    value: (Math.random() * 1e18).toFixed(0),
    children: (isChild) ? [] : undefined,
    isLeaf: isChild,
    loading: isChild
  }
}

const mockData = () => {
  const children: DefaultOptionType[] = []
  for (let i = 0; i < Math.random() * 1000; i++) {
    children.push(createNode())
  }
  return children
}

// storybook is non-deterministic when creating children with mockData
export function LazyNestedSingle () {
  const [options, setOptions] = React.useState<DefaultOptionType[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setOptions(mockData)
  }, [])

  const loadData = (selectedOptions: DefaultOptionType[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption['loading'] = true
    setLoading(true)

    // load options lazily
    setTimeout(() => {
      setLoading(false)
      targetOption['loading'] = false
      targetOption.children = mockData()
      setOptions([...options])
    }, 1000)
  }

  return <NetworkFilter
    placeholder='Entire Organization'
    options={options as Option[]}
    onApply={onApply}
    onCancel={onCancel}
    loadData={loadData}
    loading={loading}
    changeOnSelect
  />
}