import { storiesOf } from '@storybook/react'

import { BasicTable }                 from './BasicTable'
import { ColumnSortAndShowHideTable } from './ColumnSortAndShowHideTable'
import { CompactTable }               from './CompactTable'
import { CustomTable }                from './CustomTable'
import { EllipsisTable }              from './EllipsisTable'
import { FilteredTable }              from './FilteredTable'
import { MultipleSorterTable }        from './MultipleSorterTable'
import { MultiSelectTable }           from './MultiSelectTable'
import { SingleSelectTable }          from './SingleSelectTable'

storiesOf('Table', module)
  .add('Basic', BasicTable)
  .add('Customizations', CustomTable)
  .add('With Filters', FilteredTable)
  .add('Multiple Sorter', MultipleSorterTable)
  .add('Multi Select', MultiSelectTable)
  .add('Single Select', SingleSelectTable)
  .add('Column Sort & Show/Hide', ColumnSortAndShowHideTable)
  .add('Ellipsis', EllipsisTable)
  .add('Compact', CompactTable)

export {}
