import { useEffect } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, DisabledButton, Loader, showToast } from '@acx-ui/components'
import { useTenantLink }                             from '@acx-ui/react-router-dom'

import * as contents                                           from '../../contents'
import { useServiceGuardTest, useRunServiceGuardTestMutation } from '../../services'
import { statsFromSummary }                                    from '../../utils'

export const ReRunButton = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/serviceValidation')
  const params = useParams<{ specId: string }>()

  const queryResults = useServiceGuardTest()
  const summary = statsFromSummary(queryResults.data?.summary)

  const { runTest, response } = useRunServiceGuardTestMutation()

  useEffect(() => {
    if (!response.data) return
    if (!response.data.userErrors) {
      const testId = response.data.spec.tests.items[0].id
      showToast({
        type: 'success',
        content: $t(contents.messageMapping.RUN_TEST_SUCCESS)
      })
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${response.data.spec.id}/tests/${testId}`
      })
    } else {
      const key = response.data.userErrors[0].message as keyof typeof contents.messageMapping
      const errorMessage = $t(contents.messageMapping[key])
      showToast({ type: 'error', content: errorMessage })
    }
  }, [response])

  return <Loader states={[queryResults, response]}>
    {(!summary.isOngoing && queryResults.data?.spec.apsCount)
      ? <Button
        type='primary'
        onClick={async () => runTest({ id: params.specId! })}
      >
        {$t({ defaultMessage: 'Re-Run Test' })}
      </Button>
      : <DisabledButton title={$t(
        summary.isOngoing
          ? contents.messageMapping.TEST_IN_PROGRESS
          : contents.messageMapping.RUN_TEST_NO_APS
      )}>
        {$t({ defaultMessage: 'Re-Run Test' })}
      </DisabledButton>}
  </Loader>
}
