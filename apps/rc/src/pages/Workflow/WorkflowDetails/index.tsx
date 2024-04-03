
import 'reactflow/dist/style.css'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader } from '@acx-ui/components'
import { filterByAccess }     from '@acx-ui/user'

import WorkflowPanel from '../WorkflowPanel'


export default function Workflow () {
  const { $t } = useIntl()
  const { serviceId: workflowId } = useParams()

  const extra = filterByAccess([
    <Button type={'primary'} onClick={()=>{}}>
      {$t({ defaultMessage: 'Save' })}
    </Button>
  ])

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Onboarding Experience' })}
        extra={extra}
      />
      <WorkflowPanel
        workflowId={workflowId ?? ''}
      />
    </>
  )
}
