import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useGetMspEcDelegationsQuery }       from '@acx-ui/rc/services'
import { defaultSort, Delegation, sortProp } from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

export const MSPAdministratorsTable = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { data, isLoading, isFetching } = useGetMspEcDelegationsQuery({ params })

  const columns: TableProps<Delegation>['columns'] = [
    {
      title: $t({ defaultMessage: 'MSP Name' }),
      key: 'delegatedToName',
      dataIndex: 'delegatedToName',
      sorter: { compare: sortProp('status', defaultSort) },
      render: (_, row) => {
        return row.delegatedToName
      }
    }
  ]

  return (
    <Loader states={[
      { isLoading: isLoading,
        isFetching: isFetching
      }
    ]}>
      <UI.TableTitleWrapper>
        {$t({ defaultMessage: 'MSP Administrators' })}
      </UI.TableTitleWrapper>
      <Table
        columns={columns}
        dataSource={data}
        rowKey='id'
      />
    </Loader>
  )
}
