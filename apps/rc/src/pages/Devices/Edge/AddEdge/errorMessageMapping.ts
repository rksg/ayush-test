import { CatchErrorResponse } from '@acx-ui/rc/utils'
import { getIntl }            from '@acx-ui/utils'

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
      content: $t({ defaultMessage: "There's no available SmartEdge license" })
    },
    'EDGE-10101': {
      title: $t({ defaultMessage: 'Error' }),
      content: $t({ defaultMessage: 'SmartEdge with the given serial number already exists' })
    },
    'EDGE-10116': {
      title: $t({ defaultMessage: 'Error' }),
      content: $t({ defaultMessage: 'The selected venue already has a SmartEdge' })
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