import { SingleValueType } from 'rc-cascader/lib/Cascader'

import { showToast } from '../../Toast'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export const helper = (val?: SingleValueType | SingleValueType[]) => {
  if (val && Array.isArray(val)) {
    let ret = ''
    for (let i = 0; i < val.length; i++) {
      ret += JSON.stringify(val[i], ['value', 'label']) + ' '
    }

    return (ret === '') ? 'empty list value' : ret
  } else if (val) {
    return JSON.stringify(val)
  }

  return 'no cascader selection'
}

export const onApply = (
  selectedOptions?: SingleValueType | SingleValueType[],
  radioBandsSelected?: CheckboxValueType[]
) => {
  showToast({
    type: 'success',
    content: `Options Selected: ${helper(selectedOptions)}
     | Radio Bands Selected: ${radioBandsSelected?.length ? radioBandsSelected : 'none' }
    `
  })
}
