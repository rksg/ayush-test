import { useState, useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { SummaryCard }                         from '@acx-ui/components'
import { EnrollmentPortalLink, WorkflowPanel } from '@acx-ui/rc/components'
import {
  useGetWorkflowByIdQuery,
  useLazySearchWorkflowListQuery
} from '@acx-ui/rc/services'
import { Workflow, WorkflowPanelMode } from '@acx-ui/rc/utils'



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
            if (v.publishedDetails?.status === 'PUBLISHED') {
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
        other {Draft}
      }` }, {
        status: data?.publishedDetails?.status
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
      visible: data?.publishedDetails?.status === 'PUBLISHED',
      content: () => {
        const link = data?.links?.find(v => v.rel === 'enrollmentPortal')
        if (link) return <EnrollmentPortalLink url={link.href} />
        return undefined
      },
      colSpan: 5
    }
  ]

  return (
    <>
      <SummaryCard
        data={workflowInfo}
        isLoading={workflowQuery.isLoading}
        isFetching={workflowQuery.isFetching}
      />
      <WorkflowPanel
        workflowId={data?.id!!}
        mode={WorkflowPanelMode.Default}
      />
    </>
  )
}
