import { RadiusOptionsForm } from '@acx-ui/rc/components'

interface RadiusOptionsOfMoreSettingsFormProps {
  context: string,
  showSingleSessionIdAccounting: boolean,
  isWispr?: boolean,
  onDataChanged?: ()=> void
}

function RadiusOptionsOfMoreSettingsForm (
  {
    context,
    showSingleSessionIdAccounting,
    isWispr,
    onDataChanged
  }: RadiusOptionsOfMoreSettingsFormProps) {


  return (
    <RadiusOptionsForm
      context={context}
      showSingleSessionIdAccounting={showSingleSessionIdAccounting}
      isWispr={isWispr}
      onDataChanged={onDataChanged}
    />
  )
}

export default RadiusOptionsOfMoreSettingsForm