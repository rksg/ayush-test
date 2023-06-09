import { storiesOf } from '@storybook/react'

import { BasicTable }              from './BasicTable'
import { ColumnSettings }          from './ColumnSettings'
import { CompactTable }            from './CompactTable'
import { CompactTableWithBorders } from './CompactTableWithBorders'
import { CustomTable }             from './CustomTable'
import { FilteredTable }           from './FilteredTable'
import { FormTable }               from './FormTable'
import { GroupTable }              from './GroupTable'
import { MultipleSorterTable }     from './MultipleSorterTable'
import { MultiSelectTable }        from './MultiSelectTable'
import { NoSelectedBarTable }      from './NoSelectedBarTable'
import { SelectAllPagesTable }     from './SelectAllPagesTable'
import { SingleSelectTable }       from './SingleSelectTable'
import { TableWithIconButton }     from './TableWithIconButton'

storiesOf('Table', module)
  .add('Basic', BasicTable)
  .add('Customizations', CustomTable)
  .add('With Filters', FilteredTable)
  .add('Multiple Sorter', MultipleSorterTable)
  .add('Multi Select', MultiSelectTable)
  .add('Select Data from All Pages', SelectAllPagesTable)
  .add('Single Select', SingleSelectTable)
  .add('Column Settings', ColumnSettings)
  .add('No Selected Bar Table', NoSelectedBarTable)
  .add('Compact', CompactTable)
  .add('Compact Table With Borders in Rows', CompactTableWithBorders)
  .add('Form Table', FormTable)
  .add('Group Table', GroupTable)
  .add('Table With Icon Button', TableWithIconButton)
export {}
