import { DefaultOptionType } from 'antd/lib/cascader'

import { showToast } from '../../Toast'

export const helper = (val?: DefaultOptionType[] | DefaultOptionType[][]) => {
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
  selectedOptions?: DefaultOptionType[] | DefaultOptionType[][]
) => {
  showToast({
    type: 'success',
    content: `Cascader Options Selected: ${helper(selectedOptions)}`
  })
}

export const onCancel = () => {
  showToast({
    type: 'info',
    content: 'cascader successfully closed'
  })
}
