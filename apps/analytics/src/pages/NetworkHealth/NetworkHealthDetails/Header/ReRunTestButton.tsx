import { useEffect } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Button, Loader, showToast } from '@acx-ui/components'
import { useTenantLink }             from '@acx-ui/react-router-dom'

import * as contents                    from '../../contents'
import { useNetworkHealthTestMutation } from '../../services'

export const ReRunButton = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/serviceValidation/networkHealth')
  const params = useParams<{ specId: string }>()
  const { runTest, response } = useNetworkHealthTestMutation()

  useEffect(() => {
    if (!response.data) return
    if (!response.data.userErrors) {
      const testId = response.data.spec.tests.items[0].id
      showToast({
        type: 'success',
        content: $t(contents.messageMapping.TEST_RUN_CREATED)
      })
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}/${params.specId}/tests/${testId}`
      })
    } else {
      const key = response.data.userErrors[0].message as keyof typeof contents.messageMapping
      const errorMessage = $t(contents.messageMapping[key])
      showToast({ type: 'error', content: errorMessage })
    }
  }, [response])

  return <Loader states={[response]}>
    <Button
      type='primary'
      onClick={async () => { await runTest({ specId: params.specId! }).unwrap() }}
    >
      {$t({ defaultMessage: 'Re-Run Test' })}
    </Button>
  </Loader>
}
