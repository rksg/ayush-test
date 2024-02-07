import { useState } from 'react'

import { Menu, Space }                               from 'antd'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { Dropdown, Button, CaretDownSolidIcon } from '@acx-ui/components'

export type SliceType = 'property' | 'lsp'
type Slices = {
  [type in SliceType]?: MessageDescriptor;
}
const slices: Slices = {
  lsp: defineMessage({ defaultMessage: 'LSP' }),
  property: defineMessage({ defaultMessage: 'Property' })
}
export const useSliceType = ({ isLSP }: { isLSP: boolean }) => {
  const { $t } = useIntl()
  // Remove lsp option in case of LSP account
  if (isLSP) {
    delete slices.lsp
  }
  const [sliceType, setSliceType] = useState<SliceType>(isLSP ? 'property' : 'lsp')
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
      {() => <Button><Space>{$t(slices[sliceType]!)}<CaretDownSolidIcon /></Space></Button>}
    </Dropdown>
  }
}
