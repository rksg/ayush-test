import { DefaultOptionType } from 'antd/lib/cascader'

import { NetworkFilter } from '..'
import { showToast }     from '../../Toast'


const options = [
  {
    value: 'n1',
    label: 'SSID 1'
  },
  {
    value: 'n2',
    label: 'SSID 2'
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
  selectedRadio: string[],
  selectedOptions: DefaultOptionType[] | DefaultOptionType[][]
) => {
  showToast({
    type: 'success',
    content: 
      `Radio selected: 
        ${(selectedRadio && selectedRadio.length === 0) ? selectedRadio : 'no radio selected'}, 
      Cascader Options Selected: ${helper(selectedOptions)}`
  })
}

const onCancel = () => {
  showToast({
    type: 'info',
    content: 'cascader successfully closed'
  })
}

export function WithSingleList () {
  return <NetworkFilter
    placeholder='Single List, multi false'
    options={options}
    onApply={onApply}
    onCancel={onCancel}
  />
}