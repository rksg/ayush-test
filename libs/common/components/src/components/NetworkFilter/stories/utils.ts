import { SingleValueType }   from 'rc-cascader/lib/Cascader'

import { showToast } from '../../Toast'

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
  selectedOptions?: SingleValueType | SingleValueType[] | undefined
) => {
  showToast({
    type: 'success',
    content: `Cascader Options Selected: ${helper(selectedOptions)}`
  })
}
