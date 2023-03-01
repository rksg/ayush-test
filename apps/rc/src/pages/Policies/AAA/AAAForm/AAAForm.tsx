import { useRef, useEffect, useState } from 'react'

import _                      from 'lodash'
import { IntlShape, useIntl } from 'react-intl'

import {
  PageHeader, showActionModal, showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { useAaaPolicyQuery, useAddAAAPolicyMutation, useLazyValidateRadiusQuery, useUpdateAAAPolicyMutation } from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusErrorsType,
  RadiusValidate,
  RadiusValidateErrors
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { multipleConflictMessage, radiusErrorMessage } from '../../../Networks/wireless/NetworkForm/contentsMap'

import AAASettingForm from './AAASettingForm'


type AAAFormProps = {
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: AAAPolicyType) => void
}
const AAAForm = (props: AAAFormProps) => {
  const { $t } = useIntl()
  const intl = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = useParams()
  const edit = props.edit && !props.networkView
  const formRef = useRef<StepsFormInstance<AAAPolicyType>>()
  const { data } = useAaaPolicyQuery({ params }, { skip: !props.edit })
  const [ createAAAPolicy ] = useAddAAAPolicyMutation()

  const [ updateAAAPolicy ] = useUpdateAAAPolicyMutation()
  const [saveState, updateSaveState] = useState<AAAPolicyType>({
    name: ''
  })
  const [getValidateRadius] = useLazyValidateRadiusQuery()
  const updateSaveData = (saveData: Partial<AAAPolicyType>) => {
    updateSaveState({ ...saveState, ...saveData })
  }
  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  const addOrUpdateAAA = async (data: AAAPolicyType, edit: boolean) =>{
    if (!edit) {
      await createAAAPolicy({
        params,
        payload: data
      }).unwrap().then((res)=>{
        data.id = res?.response?.id
      })
    } else {
      await updateAAAPolicy({
        params,
        payload: data
      }).unwrap()
    }
    props.networkView? props.backToNetwork?.(data) : navigate(linkToPolicies, { replace: true })
  }
  const checkRadiusError = async (
    newData: Partial<AAAPolicyType>,
    error: RadiusValidate
  ) => {
    const { status, data } = error
    if (status === 404) { return false }

    if (status === 422) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Server Configuration Conflict' }),
        content: data.errors[0].message
      })
      return true
    }

    if (data?.errors) {
      const radiusType = ['accountingRadius', 'authRadius']
      const errors = data?.errors
      const errorList = errors.reduce((
        result: Record<string, boolean | number>,
        error: RadiusValidateErrors,
        index: number
      ) => {
        const key = error.object?.split('.')[1]
        const msgArray = error.message.split('Authentication Profile')
        msgArray.forEach((item, index) => {
          if (item?.includes('multiple conflict')) {
            const key = `${radiusType[index]}MultipleConflict`
            result[key] = true
          }
        })
        result[key] = index
        return result
      }, {} as Record<string, boolean | number>)

      const conflictErrors = Object.keys(errorList)?.filter(x => x.includes('MultipleConflict'))
      const radiusErrors = radiusType.filter(x => Object.keys(errorList).includes(x))
        .map(x => x.split('Radius')[0].toUpperCase())

      if (conflictErrors.length) {
        const keys = conflictErrors.map(k => k.split('Radius')[0].toUpperCase())
        const conflictMessage = keys.length === 2
          ? multipleConflictMessage[RadiusErrorsType.AUTH_AND_ACC]
          : multipleConflictMessage[keys[0] as RadiusErrorsType]

        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Server Configuration Conflict' }),
          content: $t(conflictMessage)
        })
      } else if (radiusErrors.length) {
        const errorMessage = radiusErrors.length === 2
          ? $t( radiusErrorMessage[RadiusErrorsType.AUTH_AND_ACC] )
          : $t( radiusErrorMessage[radiusErrors[0] as RadiusErrorsType] )

        showConfigConflictModal(
          errorMessage,
          newData,
          errors,
          errorList,
          formRef?.current,
          saveState,
          addOrUpdateAAA,
          edit,
          intl
        )
      } else {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Occured Error' }),
          content: errors[0].message
        })
      }
      return true
    }
    return false
  }
  const handleAAAPolicy = async (data: AAAPolicyType) => {
    try {
      const { error } = await getValidateRadius({ params, payload: {
        ...data, authRadius: { primary: data.primary }
      } }, true)
      const radiusValidate = error as RadiusValidate ?? null
      const hasRadiusError = radiusValidate ? await checkRadiusError(data, radiusValidate) : false
      if(!hasRadiusError){
        await addOrUpdateAAA(data, edit)
      }
    } catch(error) {
      showToast({
        type: 'error',
        duration: 10,
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      {!props.networkView &&<PageHeader
        title={edit
          ? $t({ defaultMessage: 'Edit AAA (802.1x) Server' })
          : $t({ defaultMessage: 'Add AAA (802.1x) Server' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: tablePath }
        ]}
      />}
      <StepsForm<AAAPolicyType>
        formRef={formRef}
        onCancel={() => props.networkView? props.backToNetwork?.():navigate(linkToPolicies)}
        onFinish={async (data) => {return handleAAAPolicy(data)}}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={edit} saveState={saveState}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
function showConfigConflictModal (
  message: string,
  data: Partial<AAAPolicyType>,
  errors: RadiusValidateErrors[],
  errorList: Record<string, boolean | number>,
  form: StepsFormInstance<AAAPolicyType> | undefined,
  saveState: AAAPolicyType,
  addOrUpdateAAA: Function,
  edit: Boolean,
  intl: IntlShape
) {
  const { $t } = intl
  const authIndex = _.get(errorList, 'authRadius') as number
  const accountIndex = _.get(errorList, 'accountingRadius') as number
  const handleExisting = async () => {
    const authErrors = authIndex > -1 && errors[authIndex].value
    const accountErrors = accountIndex > -1 && errors[accountIndex].value
    let saveData = {
      ...saveState,
      ...data
    } as Partial<AAAPolicyType>
    if(authErrors || accountErrors){
      delete saveData.secondary
    }
    addOrUpdateAAA(saveData, edit)
  }

  const handleOverride = async () => {
    const settingData = {
      ...saveState,
      ...data
    }
    addOrUpdateAAA(settingData, edit)
  }

  showActionModal({
    type: 'warning',
    width: 600,
    title: $t({ defaultMessage: 'Server Configuration Conflict' }),
    content: message,
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [{
        text: $t({ defaultMessage: 'Cancel' }),
        type: 'link',
        key: 'cancel'
      }, {
        text: $t({ defaultMessage: 'Use existing server configuration' }),
        type: 'primary',
        key: 'existing',
        closeAfterAction: true,
        handler: handleExisting
      }, {
        text: $t({ defaultMessage: 'Override the conflicting server configuration' }),
        type: 'primary',
        key: 'override',
        closeAfterAction: true,
        handler: handleOverride
      }]
    }
  })
}
export default AAAForm
