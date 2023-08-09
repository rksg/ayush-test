import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy
} from '@acx-ui/components'
import { useParams, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import SummaryForm from '../MigrationForm/SummaryForm'

function MigrationSummary () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { taskId } = useParams()
  const linkToMigration = useTenantLink('/administration/onpremMigration')

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'ZD Migration Summary' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'ZD Migration' }), link: '/administration/onpremMigration' }
        ]}
      />
      <StepsFormLegacy
        buttonLabel={{
          next: '',
          submit: '',
          pre: '',
          cancel: $t({ defaultMessage: 'Done' })
        }}
        onCancel={() => navigate(linkToMigration)}
      >
        <StepsFormLegacy.StepForm>
          <SummaryForm taskId={taskId} />
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}

export default MigrationSummary
