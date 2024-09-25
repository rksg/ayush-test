import { useCallback, useState } from 'react'

import { useIntl } from 'react-intl'

import { Drawer, Loader, SuspenseBoundary, Table, TableProps } from '@acx-ui/components'
import { formatter }                                           from '@acx-ui/formatter'
import { noDataDisplay }                                       from '@acx-ui/utils'

import { DescriptionRow }           from '../../DescriptionSection'
import { useIntentContext }         from '../IntentContext'
import { IntentAP, useGetApsQuery } from '../services'
import { useIntentParams }          from '../useIntentDetailsQuery'

export const ImpactedAPCount = () => {
  const { $t } = useIntl()
  const params = useIntentParams()
  const { state } = useIntentContext()
  const [drawerVisible, setDrawerVisible] = useState(false)
  const hasData = state !== 'no-data'

  const response = useGetApsQuery({ ...params, search: '' }, { skip: !hasData })
  const onClick = useCallback(() => setDrawerVisible(true), [])

  let children: React.ReactNode = hasData
    ? $t(
      { defaultMessage: '{count} of {count} {count, plural, one {AP} other {APs}} ({percent})' },
      { count: response.data?.length, percent: formatter('percent')(100) }
    )
    : noDataDisplay

  children = <Loader
    states={[response]}
    style={{ display: 'inline-block' }}
    fallback={<SuspenseBoundary.DefaultFallback size='small' />}
    children={children}
  />

  return <>
    <DescriptionRow onClick={hasData ? onClick : undefined} children={children} />
    {hasData ? <ImpactedAPsDrawer
      total={response.data?.length ?? 0}
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
    /> : null}
  </>
}

const ImpactedAPsDrawer = ({ total, visible, onClose } :
  { total: number, visible: boolean, onClose: () => void }) => {
  const { $t } = useIntl()
  const params = useIntentParams()
  const [search, setSearch] = useState('')
  const response = useGetApsQuery({ ...params, search })
  const columns: TableProps<IntentAP>['columns'] = [
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
    destroyOnClose
    width='600px'
    title={$t(
      { defaultMessage: '{count} Impacted {count, plural, one {AP} other {APs}}' },
      { count: total }
    )}
    onClose={onClose}
    visible={visible}
    children={
      <Loader states={[response]}>
        <Table<IntentAP>
          rowKey='mac'
          columns={columns}
          onFilterChange={(_, { searchString }) => setSearch(searchString || '')}
          searchableWidth={390}
          enableApiFilter
          dataSource={response.data}
        />
      </Loader>
    }
  />
}
