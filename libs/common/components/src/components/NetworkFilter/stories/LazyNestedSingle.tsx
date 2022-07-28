import React from 'react'

import { DefaultOptionType } from 'antd/es/cascader'

import { NetworkFilter, Option } from '..'

import { onApply, onCancel } from './utils'


const createNode: () => DefaultOptionType = () => {
  return {
    label: `Node ${(Math.random() * 1e18).toString(36).slice(0, 3).toUpperCase()}`,
    value: Math.random() * 1e18,
    children: [],
    isLeaf: false
  }
}

const mockData = () => {
  const children: DefaultOptionType[] = []
  for (let i = 0; i < Math.random() * 1000; i++) {
    children.push(createNode())
  }
  return children
}


export function LazyNestedSingle () {
  const [options, setOption] = React.useState<DefaultOptionType[]>([])

  React.useEffect(() => {
    setOption(mockData)
  }, [])

  const loadData = (selectedOptions: DefaultOptionType[]) => {
    const targetOption = selectedOptions[selectedOptions.length - 1]
    targetOption['loading'] = true

    setTimeout(() => {
      targetOption['loading'] = false
      const childData = mockData()
      targetOption.children = childData
      setOption([...options])
    }, 500)
  }

  return <NetworkFilter
    placeholder='lazy nested, single select'
    options={options as Option[]}
    onApply={onApply}
    onCancel={onCancel}
    loadData={loadData}
  />
}