import Icon from '@ant-design/icons'

import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

export default function ColorBoxIcon (props: Partial<CustomIconComponentProps>) {

  const ColorSchemeBox = () => (
    <svg width='2.5em' height='2.5em' fill='currentColor' viewBox='0 0 100 100'>
      <rect
        id='rect3494'
        width='100'
        height='100'
        x='0'
        y='0'
        ry='20' />
    </svg>
  )

  return (
    <Icon component={ColorSchemeBox} {...props} />
  )
}
