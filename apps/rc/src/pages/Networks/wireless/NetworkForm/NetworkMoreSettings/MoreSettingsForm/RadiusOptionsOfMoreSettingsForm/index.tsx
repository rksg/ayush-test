import { useIntl } from 'react-intl'

import { RadiusOptionsForm } from '@acx-ui/rc/components'

interface RadiusOptionsOfMoreSettingsFormProps {
  context: string,
  showSingleSessionIdAccounting: boolean,
  isWispr?: boolean,
  onDataChanged?: ()=> void
}

const RadiusOptionsOfMoreSettingsForm = (
  {
    context,
    showSingleSessionIdAccounting,
    isWispr,
    onDataChanged
  }: RadiusOptionsOfMoreSettingsFormProps) => {
  const { $t } = useIntl()

  return (
    <>
      {$t({ defaultMessage: 'RADIUS Options' })}
      <RadiusOptionsForm
        context={context}
        showSingleSessionIdAccounting={showSingleSessionIdAccounting}
        isWispr={isWispr}
        onDataChanged={onDataChanged}
      />
    </>
  )
}

export default RadiusOptionsOfMoreSettingsForm