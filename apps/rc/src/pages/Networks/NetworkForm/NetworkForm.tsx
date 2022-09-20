import { useState, useRef, useEffect } from 'react'

import _                                     from 'lodash'
import { defineMessage, useIntl, IntlShape } from 'react-intl'

import {
  PageHeader,
  showToast,
  showActionModal,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useAddNetworkMutation,
  useGetNetworkQuery,
  useUpdateNetworkMutation,
  useLazyValidateRadiusQuery
} from '@acx-ui/rc/services'
import {
  CreateNetworkFormFields,
  NetworkTypeEnum,
  NetworkSaveData,
  RadiusErrorsType,
  RadiusValidate,
  RadiusValidateErrors
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import {
  multipleConflictMessage,
  radiusErrorMessage
} from './contentsMap'
import { NetworkDetailForm }       from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext          from './NetworkFormContext'
import { NetworkMoreSettingsForm } from './NetworkMoreSettings/NetworkMoreSettingsForm'
import { AaaSettingsForm }         from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }        from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }        from './NetworkSettings/OpenSettingsForm'
import { PskSettingsForm }         from './NetworkSettings/PskSettingsForm'
import { SummaryForm }             from './NetworkSummary/SummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave,
  transferMoreSettingsToSave
} from './parser'
import { Venues } from './Venues/Venues'

const settingTitle = defineMessage({
  defaultMessage: `{type, select,
    aaa {AAA Settings}
    dpsk {DPSK Settings}
    other {Settings}
  }`
})

export function NetworkForm () {
  const intl = useIntl()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const editMode = params.action === 'edit'
  const cloneMode = params.action === 'clone'

  const [addNetwork] = useAddNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()
  const [getValidateRadius] = useLazyValidateRadiusQuery()

  const formRef = useRef<StepsFormInstance<NetworkSaveData>>()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: NetworkTypeEnum.OPEN,
    isCloudpathEnabled: false,
    venues: []
  })

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if(saveState.isCloudpathEnabled){
      delete saveState.authRadius
      delete saveState.accountingRadius
    }else{
      delete saveState.cloudpathServerId
    }
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const { data } = useGetNetworkQuery({ params })

  useEffect(() => {
    if(data){
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      if (cloneMode) {
        formRef?.current?.setFieldsValue({ name: data.name + ' - copy' })
      }
      updateSaveData({ ...data, isCloudpathEnabled: data.cloudpathServerId !== undefined })
    }
  }, [data])

  const handleAddNetwork = async () => {
    try {
      const payload = _.omit(saveState, 'id') // omit id to handle clone
      await addNetwork({ params: { tenantId: params.tenantId }, payload: payload }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleEditNetwork = async (data: NetworkSaveData) => {
    try {
      await updateNetwork({ params, payload: { ...saveState, venues: data.venues } }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
  }

  const checkIpsValues = async (newData: Partial<CreateNetworkFormFields>) => {
    const payload = {
      networkId: saveState?.id,
      networkType: newData?.type?.toUpperCase(),
      ...newData
    }
    const { error } = await getValidateRadius({ params, payload }, true)
    return error as RadiusValidate ?? null
  }

  const checkRadiusError = async (
    newData: Partial<CreateNetworkFormFields>,
    error: RadiusValidate
  ) => {
    const { status, data } = error
    if (status === 404) { return false }

    if (status === 422) {
      showActionModal({
        type: 'error',
        title: intl.$t({ defaultMessage: 'Server Configuration Conflict' }),
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
          title: intl.$t({ defaultMessage: 'Server Configuration Conflict' }),
          content: intl.$t(conflictMessage)
        })
      } else if (radiusErrors.length) {
        const errorMessage = radiusErrors.length === 2
          ? intl.$t( radiusErrorMessage[RadiusErrorsType.AUTH_AND_ACC] )
          : intl.$t( radiusErrorMessage[radiusErrors[0] as RadiusErrorsType] )

        showConfigConflictModal(
          errorMessage,
          newData,
          errors,
          errorList,
          formRef?.current,
          saveState,
          updateSaveData,
          editMode,
          intl
        )
      } else {
        showActionModal({
          type: 'error',
          title: intl.$t({ defaultMessage: 'Occured Error' }),
          content: errors[0].message
        })
      }
      return true
    }
    return false
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          intl.$t({ defaultMessage: 'Edit Network' }) : intl.$t({ defaultMessage: 'Add Network' })}
        breadcrumb={[
          { text: intl.$t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <NetworkFormContext.Provider value={{
        editMode, cloneMode, data: saveState, setData: updateSaveState
      }}>
        <StepsForm<NetworkSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditNetwork : handleAddNetwork}
        >
          <StepsForm.StepForm
            name='details'
            title={intl.$t({ defaultMessage: 'Network Details' })}
            onFinish={async (data) => {
              const detailsSaveData = transferDetailToSave(data)
              updateSaveData(detailsSaveData)
              return true
            }}
          >
            <NetworkDetailForm />
          </StepsForm.StepForm>

          <StepsForm.StepForm
            name='settings'
            title={intl.$t(settingTitle, { type: saveState.type })}
            onFinish={async (data) => {
              const radiusChanged = !_.isEqual(data?.authRadius, saveState?.authRadius)
                          || !_.isEqual(data?.accountingRadius, saveState?.accountingRadius)
              const radiusValidate = !data.cloudpathServerId && radiusChanged
                ? await checkIpsValues(data) : false
              const hasRadiusError = radiusValidate
                ? await checkRadiusError(data, radiusValidate) : false

              if (!hasRadiusError) {
                const settingData = {
                  ...{ type: saveState.type },
                  ...data
                }
                let settingSaveData = tranferSettingsToSave(settingData)
                if(!editMode) {
                  settingSaveData = transferMoreSettingsToSave(data, settingSaveData)
                }
                updateSaveData(settingSaveData)
                return true
              }
              return false
            }}
          >
            {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm saveState={saveState}/>}
            {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm saveState={saveState}/>}
            {saveState.type === NetworkTypeEnum.DPSK && <DpskSettingsForm saveState={saveState}/>}
            {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm saveState={saveState}/>}

          </StepsForm.StepForm>
          {editMode &&
            <StepsForm.StepForm
              name='moreSettings'
              title={intl.$t({ defaultMessage: 'More Settings' })}
              onFinish={async (data) => {
                const settingSaveData = transferMoreSettingsToSave(data, saveState)

                updateSaveData(settingSaveData)
                return true
              }}>

              <NetworkMoreSettingsForm wlanData={saveState} />

            </StepsForm.StepForm>}
          <StepsForm.StepForm
            name='venues'
            title={intl.$t({ defaultMessage: 'Venues' })}
            onFinish={async (data) => {
              updateSaveData(data)
              return true
            }}
          >
            <Venues />
          </StepsForm.StepForm>
          {!editMode &&
            <StepsForm.StepForm name='summary' title={intl.$t({ defaultMessage: 'Summary' })}>
              <SummaryForm summaryData={saveState} />
            </StepsForm.StepForm>
          }
        </StepsForm>
      </NetworkFormContext.Provider>
    </>
  )
}


function showConfigConflictModal (
  message: string,
  data: Partial<CreateNetworkFormFields>,
  errors: RadiusValidateErrors[],
  errorList: Record<string, boolean | number>,
  form: StepsFormInstance<NetworkSaveData> | undefined,
  saveState: NetworkSaveData,
  updateSaveData: Function,
  editMode: boolean,
  intl: IntlShape
) {
  const authIndex = _.get(errorList, 'authRadius') as number
  const accountIndex = _.get(errorList, 'accountingRadius') as number

  const handleExisting = async () => {
    let resetFields = [] as string[]
    const authErrors = authIndex > -1 && errors[authIndex].value
    const accountErrors = accountIndex > -1 && errors[accountIndex].value
    const updateField = ['primary', 'secondary',
      'tlsEnabled', 'cnSanIdentity', 'ocspUrl', 'trustedCAChain']

    // remove Secondary Server setting
    if (authErrors) resetFields.push('enableSecondaryAuthServer', 'authRadius')
    if (accountErrors) resetFields.push('enableSecondaryAcctServer', 'accountingRadius')
    if (resetFields.length) {
      resetFields.forEach(x => delete data[x as keyof CreateNetworkFormFields])
      form?.resetFields(resetFields)
    }

    const authRadius = authErrors && updateField.reduce((result, key) => {
      const value = authErrors[key as keyof RadiusValidateErrors['value']]
      return value ? { ...result, [key]: value } : result
    }, {})

    const accountingRadius = accountErrors && updateField.reduce((result, key) => {
      const value = accountErrors[key as keyof RadiusValidateErrors['value']]
      return value ? { ...result, [key]: value } : result
    }, {})

    let saveData = {
      ...tranferSettingsToSave({
        ...saveState,
        ...data
      }),
      ...authRadius && { authRadius },
      ...accountingRadius && { accountingRadius }
    } as Partial<CreateNetworkFormFields>

    // update form value
    form?.setFieldsValue({
      ...form?.getFieldsValue(),
      ...saveData
    })

    if(!editMode) {
      saveData = transferMoreSettingsToSave(data, saveData)
    }
    updateSaveData(saveData)
    form?.submit()
  }

  const handleOverride = async () => {
    const settingData = {
      ...{ type: saveState.type },
      ...data
    }
    let settingSaveData = tranferSettingsToSave(settingData)
    if(!editMode) {
      settingSaveData = transferMoreSettingsToSave(data, settingSaveData)
    }
    updateSaveData(settingSaveData)
  }

  showActionModal({
    type: 'warning',
    width: 600,
    title: intl.$t({ defaultMessage: 'Server Configuration Conflict' }),
    content: message,
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [{
        text: intl.$t({ defaultMessage: 'Cancel' }),
        type: 'link',
        key: 'cancel'
      }, {
        text: intl.$t({ defaultMessage: 'Use existing server configuration' }),
        type: 'primary',
        key: 'existing',
        closeAfterAction: true,
        handler: handleExisting
      }, {
        text: intl.$t({ defaultMessage: 'Override the conflicting server configuration' }),
        type: 'primary',
        key: 'override',
        closeAfterAction: true,
        handler: handleOverride
      }]
    }
  })
}
