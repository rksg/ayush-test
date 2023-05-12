import { useRef, useReducer, useState, useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import {
  useUploadZdConfigMutation,
  useAddZdMigrationMutation
} from '@acx-ui/rc/services'
import {
  MigrationContextType,
  TaskContextType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import MigrationContext , { mainReducer } from '../MigrationContext'

import { MigrationSettingForm } from './MigrationSettingForm'
import SummaryForm              from './SummaryForm'
import UploadForm               from './UploadForm'
import ValidationForm           from './ValidationForm'
import ValidationStatus         from './ValidationStatus'


const MigrationForm = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToMigration = useTenantLink('/administration/onpremMigration')
  const edit = false

  const file = new Blob()
  const venueName = ''
  const description = ''
  const address = ''
  const [isFinish, setIsFinish] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  const [ validateZdAps, validateZdApsResp ] = useUploadZdConfigMutation()
  // eslint-disable-next-line max-len
  const [ validateZdApsResult, setValidateZdApsResult ] = useState<TaskContextType>({} as TaskContextType)
  const [ migrateZdAps ] = useAddZdMigrationMutation()

  useEffect(()=>{
    if (validateZdApsResp.data) {
      setValidateZdApsResult(validateZdApsResp.data)
    }
  },[validateZdApsResp])

  const formRef = useRef<StepsFormLegacyInstance<MigrationContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    file,
    venueName,
    description,
    address
  })

  return (
    <MigrationContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Migrate ZD Configuration' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Administration' }), link: '/administration' }
        ]}
      />
      <StepsFormLegacy<MigrationContextType>
        formRef={formRef}
        editMode={edit}
        buttonLabel={{
          next: isFinish ? $t({ defaultMessage: 'Migrate' }) : $t({ defaultMessage: 'Validate' }),
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
        <StepsFormLegacy.StepForm<MigrationContextType>
          name='backupFile'
          title={$t({ defaultMessage: 'Backup File Selection' })}
          onFinish={async () => {
            setIsFinish(true)
            const file = state.file as File
            const formData = new FormData()
            formData.append('backupFile', file, file.name)
            validateZdAps({ params: {}, payload: formData })
            return true
          }}
        >
          <UploadForm />
        </StepsFormLegacy.StepForm>

        <StepsFormLegacy.StepForm<MigrationContextType>
          title={$t({ defaultMessage: 'Validation Result' })}
        >
          {validateZdApsResult.taskId
            ? <ValidationForm taskId={validateZdApsResult.taskId} />
            : <ValidationStatus />
          }

        </StepsFormLegacy.StepForm>

        <StepsFormLegacy.StepForm
          name='migration'
          title={$t({ defaultMessage: 'Migration' })}
          onFinish={async () => {
            setIsMigrating(true)
            const requestJson = {
              venueName: state.venueName,
              description: state.description,
              address: state.address
            }
            // eslint-disable-next-line max-len
            migrateZdAps({ params: { ...params, id: validateZdApsResult.taskId }, payload: requestJson })
            return true
          }}
        >
          <MigrationSettingForm />
        </StepsFormLegacy.StepForm>

        <StepsFormLegacy.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          {validateZdApsResult.taskId && <SummaryForm taskId={validateZdApsResult.taskId} />}
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </MigrationContext.Provider>
  )
}

export default MigrationForm
