import { useEffect, useRef } from 'react'

import { useIntl } from 'react-intl'

import {
  StepsFormLegacy,
  StepsFormLegacyInstance,
  Loader
} from '@acx-ui/components'
import {
  useGetConnectionMeteringByIdQuery,
  useAddConnectionMeteringMutation,
  useUpdateConnectionMeteringMutation
} from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyType,
  PolicyOperation,
  getPolicyDetailsLink,
  ConnectionMetering,
  BillingCycleType
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ConnectionMeteringSettingForm } from './ConnectionMeteringSetting/ConnectionMeteringSettingForm'


function transformFormToData (form:ConnectingMeteringFormField | undefined):
  Partial<ConnectionMetering> {
  let data = {
    ...form
  }

  if (!data.rateLimitEnabled) {
    data.uploadRate = 0
    data.downloadRate = 0
  } else {
    if (!data.uploadRate) {
      data.uploadRate = 0
    }
    if (!data.downloadRate) {
      data.downloadRate = 0
    }
  }

  if (!data.consumptionControlEnabled) {
    data.dataCapacity = 0
    data.billingCycleRepeat = false
    data.billingCycleType = 'CYCLE_UNSPECIFIED'
    data.billingCycleDays = null
    data.dataCapacityEnforced = false
    data.dataCapacityThreshold = 0
  } else if (!data.billingCycleRepeat) {
    data.billingCycleType = 'CYCLE_UNSPECIFIED'
    data.billingCycleDays = null
  } else if (!data.billingCycleType) {
    data.billingCycleType ='CYCLE_UNSPECIFIED'
    data.billingCycleDays = null
  } else if (data.billingCycleType !== 'CYCLE_NUM_DAYS' as BillingCycleType) {
    data.billingCycleDays = null
  }
  return data
}

export enum ConnectionMeteringFormMode {
  CREATE,
  EDIT
}

export interface ConnectionMeteringFormProps {
  mode: ConnectionMeteringFormMode
  useModalMode?: boolean
  modalCallback?: (result:ConnectionMetering | undefined )=>void
}

export interface ConnectingMeteringFormField extends ConnectionMetering {
  rateLimitEnabled: boolean
  consumptionControlEnabled: boolean
}

export function ConnectionMeteringForm (props: ConnectionMeteringFormProps) {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const { mode, useModalMode, modalCallback } = props
  const form = useRef<StepsFormLegacyInstance<ConnectingMeteringFormField>>()
  const originData = useRef<ConnectionMetering>()
  const tablePath = mode === ConnectionMeteringFormMode.CREATE ?
    getPolicyRoutePath( { type: PolicyType.CONNECTION_METERING,
      oper: PolicyOperation.LIST }) :
    getPolicyDetailsLink({
      type: PolicyType.CONNECTION_METERING,
      oper: PolicyOperation.DETAIL,
      policyId: policyId !!
    })
  const navigate = useNavigate()
  const linkToPolicies = useTenantLink(tablePath)

  const [addConnectionMetering] = useAddConnectionMeteringMutation()
  const [
    updateConnectionMetering,
    { isLoading: isUpdating }
  ] = useUpdateConnectionMeteringMutation()
  const handleAddConnectionMetering = async (submittedData: Partial<ConnectionMetering>) => {
    return addConnectionMetering({ payload: { ...submittedData } }).unwrap()
  }

  const handleEditConnectionMetering = async (originData:ConnectionMetering|undefined,
    submittedData: Partial<ConnectionMetering>) => {
    if (originData === undefined) return

    const connectinoMeteringKeys = ['name', 'uploadRate', 'downloadRate',
      'dataCapacity', 'dataCapacityThreshold', 'dataCapacityEnforced',
      'billingCycleRepeat', 'billingCycleType', 'billingCycleDays'] as const
    const patchData = {}

    connectinoMeteringKeys.forEach(key => {
      if (submittedData[key] !== originData[key]) {
        Object.assign(patchData, { [key]: submittedData[key] })
      }
    })

    if (Object.keys(patchData).length === 0) return
    return updateConnectionMetering({ params: { id: policyId }, payload: patchData }).unwrap()
  }

  const onFinish = async (mode:ConnectionMeteringFormMode) => {
    try {
      const data = transformFormToData(form.current?.getFieldsValue())
      let result : ConnectionMetering | undefined
      if (mode === ConnectionMeteringFormMode.EDIT) {
        result = await handleEditConnectionMetering(originData.current, data)
      } else if (mode === ConnectionMeteringFormMode.CREATE) {
        result = await handleAddConnectionMetering(data)
      }
      useModalMode ? modalCallback?.(result) : navigate(linkToPolicies, { replace: true })
    } catch (error) {}
  }

  const onCancel = ()=> {
    if (!useModalMode) {
      navigate(linkToPolicies, { replace: true })
    }
    modalCallback?.(undefined)
  }

  const {
    data,
    isLoading
  } = useGetConnectionMeteringByIdQuery(
    { params: { id: policyId } },
    { skip: mode === ConnectionMeteringFormMode.CREATE }
  )

  useEffect(()=> {
    if (!data || isLoading) return
    if (mode === ConnectionMeteringFormMode.EDIT) {
      const connectionMetering = data as ConnectionMetering
      const rateLimitEnabled:boolean = ((connectionMetering.downloadRate > 0)
      || (connectionMetering.uploadRate > 0))
      const consumptionControlEnabled:boolean = (connectionMetering.dataCapacity > 0 )
      form.current?.resetFields()
      form.current?.setFieldsValue({
        ...connectionMetering,
        consumptionControlEnabled: consumptionControlEnabled,
        rateLimitEnabled: rateLimitEnabled
      })
      originData.current = connectionMetering
    }
  }, [data, isLoading])

  const buttonLabel = {
    submit: mode === ConnectionMeteringFormMode.CREATE ?
      $t({ defaultMessage: 'Add' }) : $t({ defaultMessage: 'Apply' })
  }

  return (
    <StepsFormLegacy<ConnectingMeteringFormField>
      formRef={form}
      buttonLabel={buttonLabel}
      onCancel={()=>onCancel()}
      onFinish={()=> onFinish(props.mode)}>
      <StepsFormLegacy.StepForm<ConnectingMeteringFormField>
        name='settings'
        title={$t({ defaultMessage: 'Settings' })}
      >
        <Loader states={[{
          isLoading: isLoading,
          isFetching: isUpdating
        }]}>
          <ConnectionMeteringSettingForm/>
        </Loader>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>)
}