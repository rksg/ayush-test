import { storiesOf } from '@storybook/react'

import { BasicTable }          from './BasicTable'
import { CompactTable }        from './CompactTable'
import { CustomTable }         from './CustomTable'
import { MultipleSorterTable } from './MultipleSorterTable'
import { RotatedTable }        from './RotatedTable'
import { SelectableTable } from './SelectableTable'

storiesOf('Table', module)
  .add('Basic', BasicTable)
  .add('With Custom Cell', CustomTable)
  .add('Multiple Sorter', MultipleSorterTable)
  .add('Compact', CompactTable)
  .add('Rotated', RotatedTable)
  .add('Selectable', SelectableTable)

export {}
