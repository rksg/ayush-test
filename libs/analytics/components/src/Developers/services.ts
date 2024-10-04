import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import _                       from 'lodash'

import { showToast } from '@acx-ui/components'
import { getIntl }   from '@acx-ui/utils'

function isApiError (
  error: FetchBaseQueryError
): error is ({ status: number, data: { success: boolean, error: string } }) {
  return _.has(error, 'data.error')
}

export function handleError (
  error: FetchBaseQueryError,
  defaultErrorMessage: string
) {
  const { $t } = getIntl()
  let message: string = defaultErrorMessage

  if (isApiError(error)) {
    message = $t({ defaultMessage: 'Error: {message}. (status code: {code})' }, {
      message: error.data.error,
      code: error.status
    })
  }

  showToast({ type: 'error', content: message })
}