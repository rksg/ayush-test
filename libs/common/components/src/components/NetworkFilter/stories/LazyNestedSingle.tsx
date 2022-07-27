import { DefaultOptionType } from 'antd/lib/cascader'

import { NetworkFilter, Option } from '..'
import { showToast }             from '../../Toast'

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
  }
]

const helper = (val?: DefaultOptionType[] | DefaultOptionType[][]) => {
  if (val) {
    let ret = ''
    for (let i = 0; i < val.length; i++) {
      ret += JSON.stringify(val[i]) + ' '
    }
    return ret
  }

  return 'no cascader selection'
}

const onApply = (
  selectedRadio?: string[],
  selectedOptions?: DefaultOptionType[] | DefaultOptionType[][]
) => {
  showToast({
    type: 'success',
    content: 
      `Radio selected: ${selectedRadio ? selectedRadio : 'no radio selected'}, 
      Cascader Options Selected: ${helper(selectedOptions)}`
  })
}

const onCancel = () => {
  showToast({
    type: 'info',
    content: 'cascader successfully closed'
  })
}

export function LazyNestedSingle () {
  return <NetworkFilter
    multiple
    placeholder='With CheckboxGroup'
    options={options}
    onApply={onApply}
    onCancel={onCancel}
  />
}