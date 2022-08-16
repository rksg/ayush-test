import { useState, useRef } from 'react'

import { get, isEqual }           from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  PageHeader,
  showToast,
  showActionModal,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import {
  useCreateNetworkMutation,
  useLazyValidateRadiusQuery,
  RadiusValidate,
  RadiusValidateErrors
} from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  CreateNetworkFormFields,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'

import { NetworkDetailForm } from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext    from './NetworkFormContext'
import { AaaSettingsForm }   from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }  from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }  from './NetworkSettings/OpenSettingsForm'
import { SummaryForm }       from './NetworkSummary/SummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave,
  flattenObject
} from './parser'
import { Venues } from './Venues/Venues'

/* eslint-disable max-len */
export const MultipleConflictMessage = {
  AUTH_AND_ACCOUNTING: 'The IP addresses you entered conflict with existing authentication and accounting server configuration in another network. Please change the IP address.',
  AUTH: 'The IP addresses you entered conflict with existing authentication server configuration in another network. Please change the IP address.',
  ACCOUNTING: 'The IP addresses you entered conflict with existing accounting server configuration in another network. Please change the IP address.'
}

export const ErrorMessage = {
  AUTH_AND_ACCOUNTING: 'One of the values you entered conflicts with existing authentication and accounting server configurations in another network.',
  AUTH: 'One of the values you entered conflicts with an existing authentication server configuration in another network.',
  ACCOUNTING: 'One of the values you entered conflicts with an existing accounting server configuration in another network.'
}

export enum RadiusErrorsType {
  AUTH_AND_ACCOUNTING = 'AUTH_AND_ACCOUNTING',
  AUTH = 'AUTH',
  ACCOUNTING = 'ACCOUNTING'
}
const settingTitle = defineMessage({
  defaultMessage: `{type, select,
    aaa {AAA Settings}
    dpsk {DPSK Settings}
    other {Settings}
  }`
})

export function NetworkForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  const [createNetwork] = useCreateNetworkMutation()
  //DetailsState
  const [state, updateState] = useState<CreateNetworkFormFields>({
    name: '',
    type: NetworkTypeEnum.AAA,
    isCloudpathEnabled: false,
    venues: []
  })
  const formRef = useRef<StepsFormInstance<CreateNetworkFormFields>>()

  const updateData = (newData: Partial<CreateNetworkFormFields>) => {
    updateState({ ...state, ...newData })
  }

  const [saveState, updateSaveState] = useState<NetworkSaveData>()

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    if( state.isCloudpathEnabled ){
      delete saveState?.accountingRadius
      delete saveState?.authRadius
    }else{
      delete saveState?.cloudpathServerId
    }
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const handleAddNetwork = async () => {
    try {
      await createNetwork({ params, payload: saveState }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const [getValidateRadius] = useLazyValidateRadiusQuery()

  const checkIpsValues = async (newData: Partial<CreateNetworkFormFields>) => {
    const payload = {
      ...tranferSettingsToSave(newData),
      // networkId: 
      networkType: newData?.type?.toUpperCase()
    }

    const res = await getValidateRadius({ params, payload }, true)
    const error = res?.error as RadiusValidate

    if (error?.status === 404) {
      return true
    } else if (error?.status === 422) {
      showActionModal({
        type: 'error',
        title: 'Server Configuration Conflict',
        content: error?.data?.errors[0].message
      })
      return false
    } else if (error?.data?.errors) {
      const radiusType = ['accountingRadius', 'authRadius']
      const results = error?.data?.errors.reduce((
        result: Record<string, boolean | number>,
        error: RadiusValidateErrors,
        index: number
      ) => {
        const key = error.object.split('.')[1]
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

      const conflictErrors = Object.keys(results)?.filter(x => x.includes('MultipleConflict'))
      if (conflictErrors.length) {
        const keys = conflictErrors.map(k => k.split('Radius')[0].toUpperCase())
        const multipleConflictMessage = keys.length === 2
          ? MultipleConflictMessage.AUTH_AND_ACCOUNTING
          : MultipleConflictMessage[keys[0] as RadiusErrorsType]

        showActionModal({
          type: 'error',
          title: 'Server Configuration Conflict',
          content: multipleConflictMessage
        })

      } else {
        const radiusErrors = radiusType.filter(x => Object.keys(results).includes(x))
          .map(x => x.split('Radius')[0].toUpperCase())
        const errorMessage = radiusErrors.length === 2
          ? ErrorMessage.AUTH_AND_ACCOUNTING
          : ErrorMessage[radiusErrors[0] as RadiusErrorsType]

        if (radiusErrors.length) {
          openConfigConflictModal(
            errorMessage,
            newData,
            error?.data?.errors,
            get(results, 'authRadius') as number,
            get(results, 'accountingRadius') as number
          )
        } else {
          showActionModal({
            type: 'error',
            title: 'Occured Error',
            content: error?.data?.errors[0].message
          })
        }
      }
      return false
    }
    return true
  }

  const openConfigConflictModal = async (
    message: string,
    data: Partial<CreateNetworkFormFields>,
    errors: RadiusValidateErrors[],
    authIndex: number,
    accountIndex: number
  ) => {
    showActionModal({
      type: 'warning',
      width: 600,
      title: 'Server Configuration Conflict',
      content: message,
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: 'cancel',
          type: 'link', // TODO: will change after DS update
          key: 'cancel'
        }, {
          text: 'Use existing server configuration',
          type: 'primary',
          key: 'existing',
          closeAfterAction: true,
          handler: () => handleConfigConflict(
            'existing',
            data,
            errors,
            authIndex,
            accountIndex,
            formRef?.current?.submit
          )
        }, {
          text: 'Override the conflicting server configuration',
          type: 'primary',
          key: 'override',
          closeAfterAction: true,
          handler: () => handleConfigConflict(
            'override',
            data,
            errors,
            authIndex,
            accountIndex
          )
        }]
      }
    })
  }

  const handleConfigConflict = async (
    action: string,
    data: Partial<CreateNetworkFormFields>,
    errors: RadiusValidateErrors[],
    authIndex: number,
    accountIndex: number,
    callback?: Function
  ) => {
    if (action === 'existing') {
      const authErrors = authIndex > -1 && errors[authIndex].value
      const accountErrors = accountIndex > -1 && errors[accountIndex].value
      const updateField = ['primary', 'secondary', 'tlsEnabled', 'cnSanIdentity', 'ocspUrl', 'trustedCAChain']

      const deleteRadiusSecondary = () => {
        let resetFields = [] as string[]
        const authSecondaryFields = ['authRadius.secondary.ip', 'authRadius.secondary.port', 'authRadius.secondary.sharedSecret', 'enableSecondaryAuthServer']
        const acctSecondaryFields = ['accountingRadius.secondary.ip', 'accountingRadius.secondary.port', 'accountingRadius.secondary.sharedSecret', 'enableSecondaryAcctServer']

        if (authErrors) resetFields.push(...authSecondaryFields)
        if (accountErrors) resetFields.push(...acctSecondaryFields)

        resetFields.forEach(x => delete data[x as keyof CreateNetworkFormFields])
        formRef?.current?.resetFields(resetFields)
      }

      const authRadius = authErrors && updateField.reduce((result, key) => {
        const value = authErrors[key as keyof RadiusValidateErrors['value']] 
        return value ? { ...result, [key]: value } : result
      }, {})

      const accountingRadius = accountErrors && updateField.reduce((result, key) => {
        const value = accountErrors[key as keyof RadiusValidateErrors['value']] 
        return value ? { ...result, [key]: value } : result
      }, {})

      deleteRadiusSecondary()
      
      const updatedata = {
        ...data,
        ...authRadius && flattenObject({ authRadius }),
        ...accountingRadius && flattenObject({ accountingRadius })
      }

      const saveData = {
        ...tranferSettingsToSave(data),
        ...authRadius && { authRadius },
        ...accountingRadius && { accountingRadius }
      } as Partial<CreateNetworkFormFields>

      // update form value
      formRef?.current?.setFieldsValue({
        ...formRef?.current?.getFieldsValue(),
        ...updatedata
      })

      updateData(updatedata)
      updateSaveData(saveData)
      callback && callback()

      // TODO
      // if (this.editMode)
      // }
      
    } else if (action === 'override') {
      updateData(data)
      updateSaveData(tranferSettingsToSave(data))
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Create New Network' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <StepsForm<CreateNetworkFormFields>
        formRef={formRef}
        onCancel={() => navigate(linkToNetworks)}
        onFinish={handleAddNetwork}
      >
        <StepsForm.StepForm<CreateNetworkFormFields>
          name='details'
          title={$t({ defaultMessage: 'Network Details' })}
          onFinish={async (data) => {
            const detailsSaveData = transferDetailToSave(data)
            updateData(data)
            updateSaveData(detailsSaveData)
            return true
          }}
        >
          <NetworkFormContext.Provider value={{ setNetworkType }}>
            <NetworkDetailForm />
          </NetworkFormContext.Provider>
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='settings'
          title={$t(settingTitle, { type: networkType })}
          onFinish={async (data) => {
            data = {
              ...data,
              ...{ type: state.type, isCloudpathEnabled: data.isCloudpathEnabled }
            }
            const settingSaveData = tranferSettingsToSave(data) as Partial<NetworkSaveData>
            const radiusesChanged = !isEqual(saveState?.authRadius, settingSaveData?.authRadius)
                                    || !isEqual(saveState?.accountingRadius, settingSaveData?.accountingRadius)
            const radiusesChecked = !data.cloudpathServerId && radiusesChanged ? await checkIpsValues(data) : true

            if (radiusesChecked) {
              updateData(data)
              updateSaveData(settingSaveData)
              return true
            }
            return false
          }}
        >
          {state.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
          {state.type === NetworkTypeEnum.OPEN && <OpenSettingsForm />}
          {state.type === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
        </StepsForm.StepForm>

        <StepsForm.StepForm
          name='venues'
          title={$t({ defaultMessage: 'Venues' })}
          onFinish={async (data) => {
            updateData(data)
            updateSaveData(data)
            return true
          }}
        >
          <Venues formRef={formRef} />
        </StepsForm.StepForm>

        <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
          <SummaryForm summaryData={state} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
