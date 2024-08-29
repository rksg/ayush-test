import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Drawer, Loader, Table, TableProps } from '@acx-ui/components'

import { IntentAp, useGetApsQuery } from '../services'

export const ImpactedApsDrawer = ({ aps, visible, onClose } :
  { aps: IntentAp[], visible: boolean, onClose: () => void }) => {
  const { $t } = useIntl()
  const { code, root, sliceId } = useParams()
  const [search, setSearch] = useState('')
  const impactedApsQuery = useGetApsQuery({ code: code!, root: root!, sliceId: sliceId!, search })
  const columns: TableProps<IntentAp>['columns'] = [
    {
      key: 'name',
      dataIndex: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      searchable: true
    },
    {
      key: 'model',
      dataIndex: 'model',
      title: $t({ defaultMessage: 'AP Model' }),
      searchable: true
    },
    {
      key: 'mac',
      dataIndex: 'mac',
      title: $t({ defaultMessage: 'AP MAC' }),
      searchable: true
    },
    {
      key: 'version',
      dataIndex: 'version',
      title: $t({ defaultMessage: 'AP Version' }),
      searchable: true
    }
  ]

  return <Drawer
    width='600px'
    title={$t(
      { defaultMessage: '{count} Impacted {count, plural, one {AP} other {APs}}' },
      { count: aps!.length }
    )}
    style={{
      display: visible ? 'block' : 'none'
    }}
    onClose={onClose}
    visible={visible}
    children={
      <Loader states={[impactedApsQuery]}>
        <Table<IntentAp>
          rowKey='mac'
          columns={columns}
          onFilterChange={(_, { searchString }) => setSearch(searchString || '')}
          searchableWidth={390}
          enableApiFilter
          dataSource={impactedApsQuery.data}
        />
      </Loader>
    }
  />
}