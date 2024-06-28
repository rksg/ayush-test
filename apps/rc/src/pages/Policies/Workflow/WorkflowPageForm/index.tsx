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
  getPolicyListRoutePath
} from '@acx-ui/rc/utils'

export default function WorkflowPageForm (props: WorkflowFormProps) {
  const { $t } = useIntl()
  const { mode } = props
  return (
    <>
      <PageHeader
        breadcrumb={
          [
            { text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true) }
          ]}
        title={mode === WorkflowFormMode.CREATE ?
          $t({ defaultMessage: 'Add Workflow' }):
          $t({ defaultMessage: 'Edit Workflow' })
        }
      />
      <WorkflowForm {...props}/>
    </>)
}