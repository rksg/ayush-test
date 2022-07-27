import { storiesOf } from '@storybook/react'

import { BasicTable }                 from './BasicTable'
import { CompactTable }               from './CompactTable'
import { CustomTable }                from './CustomTable'
import { MultipleSorterTable }        from './MultipleSorterTable'
import { MultiSelectTable }           from './MultiSelectTable'
import { SingleSelectTable }          from './SingleSelectTable'
import { TableColumnSortAndShowHide } from './TableColumnSortAndShowHide'

storiesOf('Table', module)
  .add('Basic', BasicTable)
  .add('With Custom Cell', CustomTable)
  .add('Multiple Sorter', MultipleSorterTable)
  .add('Compact', CompactTable)
  .add('Multi Select', MultiSelectTable)
  .add('Single Select', SingleSelectTable)
  .add('Column Sort & Show/Hide', TableColumnSortAndShowHide)

export {}
