import { useRef, useReducer, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  FacilityEnum,
  FlowLevelEnum,
  PriorityEnum,
  ProtocolEnum,
  SyslogVenue,
  SyslogContextType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import MigrationContext , { mainReducer } from '../MigrationContext'

import { MigrationSettingForm } from './MigrationSettingForm'
import MigrationStatusForm      from './MigrationStatusForm'
import UploadForm               from './UploadForm'


const MigrationForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToMigration = useTenantLink('/administration/onpremMigration')
  const edit = false

  const policyName = ''
  const server = ''
  const port = 514
  const protocol = ProtocolEnum.UDP
  const secondaryServer = ''
  const secondaryPort = 514
  const secondaryProtocol = ProtocolEnum.TCP
  const facility = FacilityEnum.KEEP_ORIGINAL
  const priority = PriorityEnum.INFO
  const flowLevel = FlowLevelEnum.CLIENT_FLOW
  const venues:SyslogVenue[] = []
  const [isFinish, setIsFinish] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  const formRef = useRef<StepsFormInstance<SyslogContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    policyName,
    server,
    port,
    protocol,
    secondaryServer,
    secondaryPort,
    secondaryProtocol,
    facility,
    priority,
    flowLevel,
    venues
  })

  const waitTime = (time: number = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, time)
    })
  }

  return (
    <MigrationContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Migrate ZD Configuration' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Administration' }), link: '/administration' }
        ]}
      />
      <StepsForm<SyslogContextType>
        formRef={formRef}
        editMode={edit}
        buttonLabel={{
          next: isFinish ? $t({ defaultMessage: 'Migrate' }) : $t({ defaultMessage: 'Next' }),
          submit: undefined,
          pre: isMigrating ? undefined : $t({ defaultMessage: 'Back' }),
          cancel: isMigrating ? $t({ defaultMessage: 'Done' }) : $t({ defaultMessage: 'Cancel' })
        }}
        onCurrentChange={(current) => {
          if (current === 0) {
            setIsFinish(false)
          }
        }}
        onCancel={() => navigate(linkToMigration)}
      >
        <StepsForm.StepForm<SyslogContextType>
          name='backupFile'
          title={$t({ defaultMessage: 'Backup File Selection' })}
          onFinish={async () => {
            setIsFinish(true)
            return true
          }}
        >
          <UploadForm />
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='migration'
          title={$t({ defaultMessage: 'Migration' })}
          onFinish={async () => {
            setIsMigrating(true)
            await waitTime(2000)
            return true
          }}
        >
          {!isMigrating
            ? <MigrationSettingForm />
            : <MigrationStatusForm />
          }
        </StepsForm.StepForm>

        { !edit && <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          <div>Summary</div>
        </StepsForm.StepForm> }
      </StepsForm>
    </MigrationContext.Provider>
  )
}

export default MigrationForm
