import { storiesOf } from '@storybook/react'

import { BasicTable }                 from './BasicTable'
import { ColumnSortAndShowHideTable } from './ColumnSortAndShowHideTable'
import { CompactTable }               from './CompactTable'
import { CustomTable }                from './CustomTable'
import { FormTable }                  from './FormTable'
import { MultipleSorterTable }        from './MultipleSorterTable'
import { MultiSelectTable }           from './MultiSelectTable'
import { SingleSelectTable }          from './SingleSelectTable'

storiesOf('Table', module)
  .add('Basic', BasicTable)
  .add('With Custom Cell', CustomTable)
  .add('Multiple Sorter', MultipleSorterTable)
  .add('Multi Select', MultiSelectTable)
  .add('Single Select', SingleSelectTable)
  .add('Column Sort & Show/Hide', ColumnSortAndShowHideTable)
  .add('Compact', CompactTable)
  .add('Form Table', FormTable)

export {}
