import { useRef, useReducer, useState, useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  showActionModal,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import {
  useUploadZdConfigMutation,
  useAddZdMigrationMutation
} from '@acx-ui/rc/services'
import {
  CatchErrorResponse,
  MigrationActionTypes,
  MigrationContextType,
  TaskContextType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import MigrationContext , { mainReducer } from '../MigrationContext'

import { MigrationSettingForm } from './MigrationSettingForm'
import { defaultAddress }       from './MigrationSettingForm'
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
  const address = defaultAddress
  const errorMsg = ''
  const [isMigrate, setIsMigrate] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [step, setStep] = useState(0)

  const [ validateZdAps, validateZdApsResp ] = useUploadZdConfigMutation()
  // eslint-disable-next-line max-len
  const [ validateZdApsResult, setValidateZdApsResult ] = useState<TaskContextType>({} as TaskContextType)
  // eslint-disable-next-line max-len
  // const [ validateError, setValidateError ] = useState<ErrorType>({} as ErrorType)
  const [ migrateZdAps ] = useAddZdMigrationMutation()

  useEffect(()=>{
    if (validateZdApsResp.data) {
      setValidateZdApsResult(validateZdApsResp.data)
    }
    // if (validateZdApsResp.data.error) {
    //   setValidateError(validateZdApsResp.data.error?.data)
    // }
  },[validateZdApsResp])

  const formRef = useRef<StepsFormLegacyInstance<MigrationContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    file,
    venueName,
    description,
    address,
    errorMsg
  })

  const nextButtonLabel = (file: File, errorMsg: string) => {
    if (file.size === 0 || errorMsg.length > 0) return undefined
    if (step === 1) return $t({ defaultMessage: 'Next' })
    return isMigrate ? $t({ defaultMessage: 'Migrate' }) : $t({ defaultMessage: 'Validate' })
  }

  const handleError = async (error: CatchErrorResponse) => {
    showActionModal({
      type: 'warning',
      title: $t({ defaultMessage: 'Warning' }),
      content: $t({ defaultMessage: 'Error occurred while validating ZD configurations' }),
      customContent: {
        action: 'SHOW_ERRORS',
        errorDetails: error
      }
    })
  }


  return (
    <MigrationContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Migrate ZD Configuration' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'ZD Migration' }), link: '/administration/onpremMigration' }
        ]}
      />
      <StepsFormLegacy<MigrationContextType>
        formRef={formRef}
        editMode={edit}
        buttonLabel={{
          next: nextButtonLabel(state.file as File, state.errorMsg as string),
          submit: undefined,
          pre: isMigrating ? undefined : $t({ defaultMessage: 'Back' }),
          cancel: isMigrating ? $t({ defaultMessage: 'Done' }) : $t({ defaultMessage: 'Cancel' })
        }}
        onCurrentChange={(current) => {
          setStep(current)
          if (current === 0) {
            setIsMigrate(false)
          }
        }}
        onCancel={() => navigate(linkToMigration)}
      >
        <StepsFormLegacy.StepForm<MigrationContextType>
          name='backupFile'
          title={$t({ defaultMessage: 'Backup File Selection' })}
          onFinish={async () => {
            const file = state.file as File
            const formData = new FormData()
            formData.append('backupFile', file, file.name)
            try {
              await validateZdAps({ params: {}, payload: formData }).unwrap()
            } catch (err) {
              handleError(err as CatchErrorResponse)
            }
            dispatch({
              type: MigrationActionTypes.ERRORMSG,
              payload: {
                errorMsg: 'Waiting for validationResult!'
              }
            })
            return true
          }}
        >
          <UploadForm />
        </StepsFormLegacy.StepForm>

        <StepsFormLegacy.StepForm<MigrationContextType>
          name='validationResult'
          title={$t({ defaultMessage: 'Validation Result' })}
          onFinish={async () => {
            setIsMigrate(true)
            return true
          }}
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
              venueName: (state.venueName && state.venueName.length > 0) ? state.venueName : null,
              description: state.description,
              address: state.address
              // address: defaultAddress
            }
            // eslint-disable-next-line max-len
            migrateZdAps({ params: { ...params, id: validateZdApsResult.taskId }, payload: requestJson })
            return true
          }}
        >
          <MigrationSettingForm countryCode={validateZdApsResult.countryCode} />
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
