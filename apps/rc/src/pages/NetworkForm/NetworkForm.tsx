import { useState, useRef, useEffect } from 'react'

import _                          from 'lodash'
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
import { NetworkDetailForm } from './NetworkDetail/NetworkDetailForm'
import NetworkFormContext    from './NetworkFormContext'
import { AaaSettingsForm }   from './NetworkSettings/AaaSettingsForm'
import { DpskSettingsForm }  from './NetworkSettings/DpskSettingsForm'
import { OpenSettingsForm }  from './NetworkSettings/OpenSettingsForm'
import { PskSettingsForm }   from './NetworkSettings/PskSettingsForm'
import { SummaryForm }       from './NetworkSummary/SummaryForm'
import {
  transferDetailToSave,
  tranferSettingsToSave,
  flattenObject
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
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToNetworks = useTenantLink('/networks')
  const params = useParams()
  const editMode = params.action === 'edit'
  const [networkType, setNetworkType] = useState<NetworkTypeEnum | undefined>()

  const [createNetwork] = useCreateNetworkMutation()
  const [updateNetwork] = useUpdateNetworkMutation()

  const formRef = useRef<StepsFormInstance<NetworkSaveData>>()

  const [saveState, updateSaveState] = useState<NetworkSaveData>({
    name: '',
    type: NetworkTypeEnum.OPEN,
    isCloudpathEnabled: false,
    venues: []
  })

  const updateSaveData = (saveData: Partial<NetworkSaveData>) => {
    const newSavedata = { ...saveState, ...saveData }
    newSavedata.wlan = { ...saveState?.wlan, ...saveData.wlan }
    updateSaveState({ ...saveState, ...newSavedata })
  }

  const { data } = useGetNetworkQuery({ params })

  useEffect(() => {
    if(data){
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData(data)
    }
  }, [data])

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
      // networkId: 
      ...newData,
      networkType: newData?.type?.toUpperCase()
    }

    const res = await getValidateRadius({ params, payload }, true)
    const error = res?.error as RadiusValidate

    if (error?.status === 404) {
      return true
    } else if (error?.status === 422) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Server Configuration Conflict' }),
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

      const conflictErrors = Object.keys(results)?.filter(x => x.includes('MultipleConflict'))
      if (conflictErrors.length) {
        const keys = conflictErrors.map(k => k.split('Radius')[0].toUpperCase())
        const conflictMessage = keys.length === 2
          ? $t( multipleConflictMessage[RadiusErrorsType.AUTH_AND_ACC] )
          : $t( multipleConflictMessage[keys[0] as RadiusErrorsType] )

        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Server Configuration Conflict' }),
          content: conflictMessage
        })

      } else {
        const radiusErrors = radiusType.filter(x => Object.keys(results).includes(x))
          .map(x => x.split('Radius')[0].toUpperCase())
        const errorMessage = radiusErrors.length === 2
          ? $t( radiusErrorMessage[RadiusErrorsType.AUTH_AND_ACC] )
          : (radiusErrors.length
            ? $t( radiusErrorMessage[radiusErrors[0] as RadiusErrorsType] )
            : '')

        if (radiusErrors.length) {
          openConfigConflictModal(
            errorMessage,
            newData,
            error?.data?.errors,
            _.get(results, 'authRadius') as number,
            _.get(results, 'accountingRadius') as number
          )
        } else {
          showActionModal({
            type: 'error',
            title: $t({ defaultMessage: 'Occured Error' }),
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
      title: $t({ defaultMessage: 'Server Configuration Conflict' }),
      content: message,
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Cancel' }),
          type: 'link', // TODO: will change after DS update
          key: 'cancel'
        }, {
          text: $t({ defaultMessage: 'Use existing server configuration' }),
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
          text: $t({ defaultMessage: 'Override the conflicting server configuration' }),
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
      const updateField = ['primary', 'secondary',
        'tlsEnabled', 'cnSanIdentity', 'ocspUrl', 'trustedCAChain']

      const deleteRadiusSecondary = () => {
        let resetFields = [] as string[]
        const authSecondaryFields = [
          'authRadius.secondary.ip',
          'authRadius.secondary.port',
          'authRadius.secondary.sharedSecret',
          'enableSecondaryAuthServer'
        ]
        const acctSecondaryFields = [
          'accountingRadius.secondary.ip',
          'accountingRadius.secondary.port',
          'accountingRadius.secondary.sharedSecret',
          'enableSecondaryAcctServer'
        ]

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

      updateSaveData(saveData)
      callback && callback()

      // TODO
      // if (this.editMode)
      // }
      
    } else if (action === 'override') {
      updateSaveData(tranferSettingsToSave(data))
    }
  }

  const handleEditNetwork = async () => {
    try {
      await updateNetwork({ params, payload: saveState }).unwrap()
      navigate(linkToNetworks, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: 'An error occurred'
      })
    }
  }
  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: 'Edit Network' }) : $t({ defaultMessage: 'Create New Network' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Networks' }), link: '/networks' }
        ]}
      />
      <NetworkFormContext.Provider value={{ setNetworkType, editMode, data }}>
        <StepsForm<NetworkSaveData>
          formRef={formRef}
          editMode={editMode}
          onCancel={() => navigate(linkToNetworks)}
          onFinish={editMode ? handleEditNetwork : handleAddNetwork}
        >
          <StepsForm.StepForm
            name='details'
            title={$t({ defaultMessage: 'Network Details' })}
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
            title={$t(settingTitle, { type: networkType })}
            onFinish={async (data) => {
              const radiusChanged = !_.isEqual(data?.authRadius, saveState?.authRadius)
                          || !_.isEqual(data?.accountingRadius, saveState?.accountingRadius)
              const radiusChecked = !data.cloudpathServerId && radiusChanged
                ? await checkIpsValues(data) : true

              if (radiusChecked) {
                const settingData = _.merge(saveState, data)
                const settingSaveData = tranferSettingsToSave(settingData)
                updateSaveData(settingSaveData)
                return true
              }
              return false
            }}
          >
            {saveState.type === NetworkTypeEnum.AAA && <AaaSettingsForm />}
            {saveState.type === NetworkTypeEnum.OPEN && <OpenSettingsForm />}
            {saveState.type === NetworkTypeEnum.DPSK && <DpskSettingsForm />}
            {saveState.type === NetworkTypeEnum.PSK && <PskSettingsForm />}
          </StepsForm.StepForm>

          <StepsForm.StepForm
            initialValues={data}
            params={data}
            request={(params) => {
              return Promise.resolve({
                data: params,
                success: true
              })
            }}
            name='venues'
            title={$t({ defaultMessage: 'Venues' })}
            onFinish={async (data) => {
              updateSaveData(data)
              return true
            }}
          >
            <Venues />
          </StepsForm.StepForm>

          <StepsForm.StepForm name='summary' title={$t({ defaultMessage: 'Summary' })}>
            <SummaryForm summaryData={saveState} />
          </StepsForm.StepForm>
        </StepsForm>
      </NetworkFormContext.Provider>
    </>
  )
}
