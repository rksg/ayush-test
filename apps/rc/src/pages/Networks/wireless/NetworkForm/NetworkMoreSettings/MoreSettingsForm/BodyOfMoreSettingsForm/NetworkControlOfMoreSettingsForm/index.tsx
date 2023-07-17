import { ServicesForm }      from '../../../../NetworkMoreSettings/ServicesForm'
import { AccessControlForm } from '../../../AccessControlForm'


interface Props
{
  showSingleSessionIdAccounting: boolean
}

function NetworkControlOfMoreSettingsForm (props: Props) {
  return (
    <>
      <div>
        <ServicesForm showSingleSessionIdAccounting={props.showSingleSessionIdAccounting} />
      </div>
      <div style={{ marginTop: '50px' }}>
        <AccessControlForm />
      </div>
    </>
  )
}

export default NetworkControlOfMoreSettingsForm