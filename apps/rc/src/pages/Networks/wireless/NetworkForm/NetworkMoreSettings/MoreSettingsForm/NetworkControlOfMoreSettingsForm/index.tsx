import {
  AccessControlForm
} from '../../../../NetworkForm/NetworkMoreSettings/AccessControlForm'
import { ServicesForm } from '../../ServicesForm'


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