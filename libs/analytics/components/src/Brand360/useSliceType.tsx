import { useState } from 'react'

import { Menu, Space }                               from 'antd'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { Dropdown, Button, CaretDownSolidIcon } from '@acx-ui/components'

export type SliceType = 'property' | 'lsp'
const slices: Record<SliceType, MessageDescriptor> = {
  lsp: defineMessage({ defaultMessage: 'LSP' }),
  property: defineMessage({ defaultMessage: 'Property' })
}

export const useSliceType = () => {
  const { $t } = useIntl()
  const [sliceType, setSliceType] = useState<SliceType>('lsp')
  return {
    sliceType,
    SliceTypeDropdown: () => <Dropdown
      key='sliceType-dropdown'
      overlay={
        <Menu
          onClick={e => setSliceType(e.key as SliceType)}
          items={Object.entries(slices).map(([key, label]) => ({ key, label: $t(label) }))}
        />
      }>
      {() => <Button><Space>{$t(slices[sliceType])}<CaretDownSolidIcon /></Space></Button>}
    </Dropdown>
  }
}
