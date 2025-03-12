import { getIntl, CatchErrorResponse } from '@acx-ui/utils'

export const getErrorModalInfo = (error: CatchErrorResponse) => {
  const { $t } = getIntl()
  const errorMessageMapping: {
    [key: string]: {
      title: string
      content: string
    }
  } = {
    'EDGE-10104': {
      title: $t({ defaultMessage: 'Error' }),
      content: $t({ defaultMessage: "There's no available RUCKUS Edge license" })
    },
    'EDGE-10101': {
      title: $t({ defaultMessage: 'Error' }),
      content: $t({ defaultMessage: 'RUCKUS Edge with the given serial number already exists' })
    },
    'EDGE-10116': {
      title: $t({ defaultMessage: 'Error' }),
      // eslint-disable-next-line max-len
      content: $t({ defaultMessage: 'The selected <venueSingular></venueSingular> already has a RUCKUS Edge' })
    }
  }
  return errorMessageMapping[error.data?.errors[0]?.code] ||
  {
    title: $t({ defaultMessage: 'Error' }),
    content: error.data?.errors[0]?.message,
    customContent: {
      action: 'SHOW_ERRORS',
      errorDetails: error
    }
  }
}
