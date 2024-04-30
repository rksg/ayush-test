import { useState, useEffect } from 'react'

import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { SummaryCard }             from '@acx-ui/components'
import { EyeOpenSolid }            from '@acx-ui/icons'
import {
  useGetWorkflowByIdQuery,
  useLazySearchWorkflowListQuery
} from '@acx-ui/rc/services'
import { Workflow } from '@acx-ui/rc/utils'


export function WorkflowDetailOverviewTab () {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const workflowQuery = useGetWorkflowByIdQuery({ params: { id: policyId } })
  const [searchVersionedWorkflowById] = useLazySearchWorkflowListQuery()
  const [data, setData] = useState<Workflow>()
  useEffect(() => {
    if (workflowQuery.isLoading) return
    setData(workflowQuery.data)
    searchVersionedWorkflowById({ params: { id: workflowQuery.data?.id, excludeContent: 'false' } })
      .then(result => {
        if (result.data) {
          result.data.data.forEach(v => {
            if (v.publishDetails?.status === 'PUBLISHED') {
              setData(v)
            }
          })
        }
      })
  }, [workflowQuery.data])

  const workflowInfo = [
    {
      title: $t({ defaultMessage: 'Status' }),
      content: $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {Published}
        PUBLISHED_INACTIVE {Published}
        other {Draft}
      }` }, {
        status: data?.publishDetails?.status
      }),
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'Active Version' }),
      content: $t({ defaultMessage: ` {
        status, select,
        PUBLISHED {Version {version}}
        other {--}
      }` }, {
        status: data?.publishDetails?.status,
        version: data?.publishDetails?.version
      }),
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'Identity Group' }),
      content: '--',
      colSpan: 3
    },
    {
      title: $t({ defaultMessage: 'Preview' }),
      content: <div><EyeOpenSolid/></div>

    }
  ]

  return (
    <>
      <Space direction={'vertical'}>
        <SummaryCard
          data={workflowInfo}
          isLoading={workflowQuery.isLoading}
          isFetching={workflowQuery.isFetching}
        />
      </Space>
      <div></div>
    </>
  )
}
