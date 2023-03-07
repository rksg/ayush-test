import { useIntl } from 'react-intl'

type SnmpAgentFormProps = {
  editMode: boolean
}

export default function SnmpAgentForm (props: SnmpAgentFormProps) {
  const { $t } = useIntl()

  const { editMode } = props

  return (
    <>
    </>
  )
}
