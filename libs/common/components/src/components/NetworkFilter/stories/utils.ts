import { SingleValueType } from 'rc-cascader/lib/Cascader'

import { showToast } from '../../Toast'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export const helper = (val?: SingleValueType | SingleValueType[]) => {
  if (val) {
    let ret = ''
    for (let i = 0; i < val.length; i++) {
      ret += JSON.stringify(val[i], ['value', 'label']) + ' '
    }
    return ret
  }

  return 'no cascader selection'
}

export const onApply = (
  selectedOptions?: SingleValueType | SingleValueType[],
  bandsSelected?: CheckboxValueType[]
) => {
  showToast({
    type: 'success',
    content: `Cascader Options Selected: ${helper(selectedOptions)}
    Bands Selected: ${bandsSelected}
    `
  })
}
