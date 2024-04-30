import { useState } from 'react'

import { Menu, Space } from 'antd'

import { Dropdown, Button, CaretDownSolidIcon } from '@acx-ui/components'

export type SliceType = 'property' | 'lsp'

interface UseSliceTypeProps {
  isLSP: boolean
  lsp: string
  property: string
}

export const useSliceType = ({ isLSP, lsp, property }: UseSliceTypeProps) => {
  const slices = { lsp, property }
  const [sliceType, setSliceType] = useState<SliceType>(isLSP ? 'property' : 'lsp')
  return {
    sliceType,
    SliceTypeDropdown: () => <Dropdown
      key='sliceType-dropdown'
      overlay={
        <Menu
          onClick={e => setSliceType(e.key as SliceType)}
          items={Object.entries(slices).map(([key, label]) => ({ key, label }))}
        />
      }>
      {() => <Button><Space>{slices[sliceType]}<CaretDownSolidIcon /></Space></Button>}
    </Dropdown>
  }
}
