import { Cascader } from '..'

import { onApply } from './utils'

export function SingleSelect () {
  return <div style={{ width: 300 }}>
    <Cascader
      placeholder='Select AP...'
      options={new Array(100).fill(0).map((_, i) => ({
        value: `${i}`, label: `Mock AP ${i}`
      }))}
      onApply={onApply}
      allowClear
    />
  </div>
}
