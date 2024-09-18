import { useIntl } from 'react-intl'

import {
  PageHeader
} from '@acx-ui/components'
import {
  WorkflowForm,
  WorkflowFormMode,
  WorkflowFormProps
} from '@acx-ui/rc/components'
import {
  PolicyType,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'

export default function WorkflowPageForm (props: WorkflowFormProps) {
  const { $t } = useIntl()
  const { mode } = props
  return (
    <>
      <PageHeader
        breadcrumb={usePolicyListBreadcrumb(PolicyType.WORKFLOW)}
        title={mode === WorkflowFormMode.CREATE ?
          $t({ defaultMessage: 'Add Workflow' }):
          $t({ defaultMessage: 'Edit Workflow' })
        }
      />
      <WorkflowForm {...props}/>
    </>)
}