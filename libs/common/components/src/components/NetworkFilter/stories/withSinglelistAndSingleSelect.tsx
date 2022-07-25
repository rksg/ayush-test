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

export function WithSinglelistAndSingleSelect () {
  return <NetworkFilter
    placeholder='Single List, Single Select'
    options={options}
    onApply={onApply}
    onCancel={onCancel}
  />
}