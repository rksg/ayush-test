import React from 'react'

import { RadioBand, Cascader, CascaderOption } from '..'

import { onApply } from './utils'


const createNode: () => CascaderOption = () => {
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
  const children: CascaderOption[] = []
  for (let i = 0; i < Math.random() * 1000; i++) {
    children.push(createNode())
  }
  return children
}

// storybook is non-deterministic when creating children with mockData
export function LazyNested ({ multiple=false,
  showRadioBand=false,
  defaultRadioBand=[],
  isRadioBandDisabled=false }:
  { multiple?:boolean,showRadioBand?:boolean,
     defaultRadioBand?:RadioBand[], isRadioBandDisabled?:boolean }) {
  const [options, setOptions] = React.useState<CascaderOption[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    setOptions(mockData)
  }, [])

  const loadData = (selectedOptions: CascaderOption[]) => {
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

  return <div style={{ width: 200 }}>
    <Cascader
      multiple={multiple}
      checkable
      showRadioBand={showRadioBand}
      defaultRadioBand={defaultRadioBand}
      isRadioBandDisabled={isRadioBandDisabled}
      radioBandDisabledReason={'Disabled for storybook.'}
      placeholder='Entire Organization'
      options={options}
      onApply={onApply}
      loadData={loadData}
      loading={loading}
      changeOnSelect
      allowClear={true}
    />
  </div>
}

export function LazyNestedWithBand (){
  return <LazyNested showRadioBand={true} defaultRadioBand={['5']}/>
}

export function LazyNestedWithBandDisabled (){
  return <LazyNested showRadioBand={true} defaultRadioBand={['2.4']} isRadioBandDisabled={true}/>
}
