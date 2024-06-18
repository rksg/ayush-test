import { useState, useEffect } from 'react'

import { Space }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { SummaryCard }             from '@acx-ui/components'
import { EnrollmentPortalLink }    from '@acx-ui/rc/components'
import {
  useGetWorkflowByIdQuery,
  useLazySearchWorkflowListQuery
} from '@acx-ui/rc/services'
import { Workflow } from '@acx-ui/rc/utils'


export function WorkflowDetailOverview () {
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
      colSpan: 2
    },
    {
      title: $t({ defaultMessage: 'Onboarding Network' }),
      visible: false,
      colSpan: 4
    },
    {
      title: $t({ defaultMessage: 'URL' }),
      visible: data?.publishDetails?.status === 'PUBLISHED',
      content: () => {
        const link = data?.links?.find(v => v.rel === 'enrollmentPortal')
        if (link) return <EnrollmentPortalLink name={data?.name!!} url={link.href} />
        return undefined
      },
      colSpan: 2
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
