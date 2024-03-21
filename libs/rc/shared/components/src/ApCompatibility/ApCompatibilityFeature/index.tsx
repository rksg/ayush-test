
import { useIntl } from 'react-intl'

import { Button, cssStr } from '@acx-ui/components'

import { CheckMarkCircleSolidIcon, WarningTriangleSolidIcon, UnknownIcon } from '../styledComponents'

export type ApCompatibilityFeatureProps = {
    count?: number,
    onClick: () => void
  }

export const ApCompatibilityFeature = (props: ApCompatibilityFeatureProps) => {
  const { $t } = useIntl()
  const { count, onClick } = props

  const fullyCompatibleTxt = $t({
    defaultMessage:
        'Fully compatible'
  })

  const partiallyIncompatibleTxt = $t({
    defaultMessage:
        'Partially incompatible'
  })

  const unknownTxt = $t({
    defaultMessage:
        'Unknown'
  })

  if (count === undefined) {
    return (
      <>
        <UnknownIcon/> {unknownTxt}
      </>
    )

  } else if (count === 0) {
    return (
      <>
        <CheckMarkCircleSolidIcon/> {fullyCompatibleTxt}
      </>
    )
  }

  return (
    <>
      <WarningTriangleSolidIcon/>
      <Button
        type='link'
        style={{ fontSize: cssStr('--acx-body-4-font-size') }}
        onClick={onClick}>
        {partiallyIncompatibleTxt}
      </Button>
    </>
  )
}
