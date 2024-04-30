import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import {  DateFormatEnum,  userDateTimeFormat } from '@acx-ui/formatter'
import { EyeOpenSolid }                         from '@acx-ui/icons'
import {
  useDeleteWorkflowMutation,
  useSearchWorkflowListQuery,
  useUpdateWorkflowMutation
} from '@acx-ui/rc/services'
import {
  PublishStatus,
  Workflow,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
function useColumns () {
  const { $t } = useIntl()

  const columns: TableProps<Workflow>['columns'] = [
    {
      key: 'versionName',
      title: $t({ defaultMessage: 'Version Name' }),
      dataIndex: 'version',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: (_, row) => $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {Version {version} (Active)}
        other {Version {version}}
      }` }, {
        status: row.publishDetails?.status,
        version: row.publishDetails?.version
      })
    },
    {
      key: 'onboardingExperience',
      title: $t({ defaultMessage: 'Onboarding Experience' }),
      dataIndex: 'onboardingExperience',
      sorter: false,
      render: (_, row) => <div><EyeOpenSolid/></div>
    },
    {
      key: 'lastPublishTime',
      title: $t({ defaultMessage: 'Last Publish Time' }),
      dataIndex: 'lastPublishTime',
      sorter: false,
      align: 'center',
      render: (_, row) => row.publishDetails?.publishedDate ?
        moment(row.publishDetails?.publishedDate)
          .format(userDateTimeFormat(DateFormatEnum.DateTimeFormat))
        :undefined

    }
  ]

  return columns
}


export default function WorkflowDetailVersionHistoryTab () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const tableQuery = useTableQuery( {
    useQuery: useSearchWorkflowListQuery,
    defaultPayload: { },
    apiParams: { id: policyId!, excludeContent: 'false' }
  })

  const [deleteWorkflow,
    { isLoading: isDeleteWorkflowing }
  ] = useDeleteWorkflowMutation()

  const [
    updateWorkflow,
    { isLoading: isUpdating }
  ] = useUpdateWorkflowMutation()

  const rowActions: TableProps<Workflow>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Activate' }),
      onClick: ([data],clearSelection) => {
        updateWorkflow({
          params: { id: data.id },
          payload: {
            publishedDetails: {
              status: 'PUBLISHED' as PublishStatus
            }
          }
        })
          .unwrap()
          // eslint-disable-next-line no-console
          .catch(e => console.log(e))
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: ([data], clearSelection) => {
        const id = data.id
        deleteWorkflow({ params: { id } })
          .unwrap()
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e)
          })
        clearSelection()
      },
      disabled: (selectedItems => selectedItems.length > 1)
    }
  ]

  return (
    <Loader
      states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteWorkflowing || isUpdating }
      ]}
    >
      <Table
        enableApiFilter
        columns={useColumns()}
        rowActions={rowActions}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
        rowSelection={{ type: 'checkbox' }}
      />
    </Loader>
  )
}
