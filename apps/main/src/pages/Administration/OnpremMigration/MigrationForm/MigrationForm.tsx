import { useRef, useReducer, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
// import {
//   useAddZdMigrationMutation, useLazyMigrateResultQuery
// } from '@acx-ui/rc/services'
import {
  // CommonResult,
  // ImportErrorRes,
  MigrationContextType
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

  const file = new Blob()
  const policyName = ''
  const server = ''
  const secondaryServer = ''
  const [isFinish, setIsFinish] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  // const [ migrateZdCsv ] = useAddZdMigrationMutation()
  // const [ migrateZdQuery ] = useLazyMigrateResultQuery()
  // const [ migrateZdResult, setMigrateZdResult ] = useState<ImportErrorRes>({} as ImportErrorRes)
  // const [isMigrationFinish, setIsMigrationFinish] = useState(false)

  // useEffect(()=>{
  //   console.log('migrate finish')
  //   if (migrateZdResult?.fileErrorsCount) {
  //     setIsMigrationFinish(true)
  //   }
  // },[migrateZdResult?.fileErrorsCount])

  const formRef = useRef<StepsFormInstance<MigrationContextType>>()
  const [state, dispatch] = useReducer(mainReducer, {
    file,
    policyName,
    server,
    secondaryServer
  })

  // const waitTime = (time: number = 100) => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(true)
  //     }, time)
  //   })
  // }

  return (
    <MigrationContext.Provider value={{ state, dispatch }}>
      <PageHeader
        title={$t({ defaultMessage: 'Migrate ZD Configuration' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Administration' }), link: '/administration' }
        ]}
      />
      <StepsForm<MigrationContextType>
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
        <StepsForm.StepForm<MigrationContextType>
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
            // await waitTime(2000)
            // const file = state.file as File
            // const newFormData = new FormData()
            // newFormData.append('file', file, file.name)
            // migrateZdCsv({ params: {}, payload: newFormData,
            //   callback: async (res: CommonResult) => {
            //     const result = await migrateZdQuery(
            //       { payload: { requestId: res.requestId } }, true)
            //       .unwrap()
            //     setMigrateZdResult(result)
            //     setIsMigrationFinish(true)
            //   } }).unwrap()
            // await waitTime(4000)

            return true
          }}
        >
          {!isMigrating
            ? <MigrationSettingForm />
            : <MigrationStatusForm />
          }
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='summary'
          title={$t({ defaultMessage: 'Summary' })}
        >
          {
            // isMigrationFinish
            // ? <div>Summary { migrateZdResult?.fileErrorsCount }</div>
            // : <MigrationStatusForm />
          }
          <MigrationStatusForm />
        </StepsForm.StepForm>
      </StepsForm>
    </MigrationContext.Provider>
  )
}

export default MigrationForm
