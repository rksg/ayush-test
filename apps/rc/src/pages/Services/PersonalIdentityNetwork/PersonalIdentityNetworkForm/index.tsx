import { ReactNode } from 'react'

import { FormInstance }                        from 'antd'
import { omit }                                from 'lodash'
import { defineMessage, useIntl }              from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { showActionModal, StepsForm, StepsFormGotoStepFn }                                 from '@acx-ui/components'
import { useValidateEdgePinSwitchConfigMutation, useValidateEdgePinClusterConfigMutation } from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  CommonResult,
  getServiceListRoutePath,
  LocationExtended,
  PersonalIdentityNetworkFormData,
  redirectPreviousPage,
  EdgeClusterInfo,
  DistributionSwitch,
  AccessSwitch
} from '@acx-ui/rc/utils'
import { useTenantLink }                                  from '@acx-ui/react-router-dom'
import { RequestPayload }                                 from '@acx-ui/types'
import { CatchErrorDetails, CatchErrorResponse, getIntl } from '@acx-ui/utils'

import { AccessSwitchForm }                         from './AccessSwitchForm'
import { DistributionSwitchForm }                   from './DistributionSwitchForm'
import { GeneralSettingsForm }                      from './GeneralSettingsForm'
import { NetworkTopologyForm, NetworkTopologyType } from './NetworkTopologyForm'
import { Prerequisite }                             from './Prerequisite'
import { SmartEdgeForm }                            from './SmartEdgeForm'
import { SummaryForm }                              from './SummaryForm'
import { WirelessNetworkForm }                      from './WirelessNetworkForm'

interface PersonalIdentityNetworkFormProps {
  editMode?: boolean
  form?: FormInstance
  onFinish: Function
  initialValues?: Object
  steps: PersonalIdentityNetworkFormStep[]
  hasPrerequisite?: boolean
}

interface PersonalIdentityNetworkFormStep {
  title: { defaultMessage: string }
  content: ReactNode
}

export const PrerequisiteStep = {
  title: defineMessage({ defaultMessage: 'Prerequisite' }),
  content: <Prerequisite />
}
export const GeneralSettingsStep = {
  title: defineMessage({ defaultMessage: 'General Settings' }),
  content: <GeneralSettingsForm />
}
export const NetworkTopologyStep = {
  title: defineMessage({ defaultMessage: 'Network Topology' }),
  content: <NetworkTopologyForm />
}
export const SmartEdgeStep = {
  title: defineMessage({ defaultMessage: 'RUCKUS Edge' }),
  content: <SmartEdgeForm />
}
export const DistributionSwitchStep = {
  title: defineMessage({ defaultMessage: 'Dist. Switch' }),
  content: <DistributionSwitchForm />
}
export const AccessSwitchStep = {
  title: defineMessage({ defaultMessage: 'Access Switch' }),
  content: <AccessSwitchForm />
}
export const WirelessNetworkStep = {
  title: defineMessage({ defaultMessage: 'Wireless Network' }),
  content: <WirelessNetworkForm />
}
export const SummaryStep = {
  title: defineMessage({ defaultMessage: 'Summary' }),
  content: <SummaryForm />
}

export const PersonalIdentityNetworkForm = (props: PersonalIdentityNetworkFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { initialValues: formInitialValues, hasPrerequisite = false } = props
  const linkToServices = useTenantLink(getServiceListRoutePath(true))
  const previousPath = (location as LocationExtended)?.state?.from?.pathname

  const [validateEdgePinSwitchConfig] = useValidateEdgePinSwitchConfigMutation()
  const [validateEdgePinClusterConfig] = useValidateEdgePinClusterConfigMutation()

  // eslint-disable-next-line max-len
  const doSwitchValidation = async (formData: PersonalIdentityNetworkFormData, payload: RequestPayload, gotoStep: StepsFormGotoStepFn, skipValidation = false) => {
    // skip when topology type is wireless
    if (formData.networkTopologyType === NetworkTopologyType.Wireless) {
      return Promise.resolve()
    }

    if (formData.distributionSwitchInfos?.length > 0 && (
      formData.accessSwitchInfos.length === 0 || !formData.accessSwitchInfos.every(as =>
        as.vlanId && as.uplinkInfo?.uplinkId && as.webAuthPageType)
    )) {
      gotoStep(4)
      return Promise.reject()
    }

    if (!skipValidation &&
      formData.distributionSwitchInfos?.length > 0 && formData.accessSwitchInfos?.length > 0) {
      try {
        await validateEdgePinSwitchConfig({
          params,
          payload: {
            pinId: formData.id || '',
            venueId: formData.venueId,
            edgeClusterId: formData.edgeClusterId,
            distributionSwitchInfos: payload.distributionSwitchInfos,
            accessSwitchInfos: payload.accessSwitchInfos
          }
        }).unwrap()
      } catch (error) {
        console.log(error) // eslint-disable-line no-console
        const errorRes = error as CatchErrorResponse
        const overwriteMsg = afterSubmitMessage(errorRes,
          [...(formData.distributionSwitchInfos || []), ...(formData.accessSwitchInfos || [])])

        if (overwriteMsg.length > 0) {
          showActionModal({
            type: 'confirm',
            width: 450,
            title: $t({ defaultMessage: 'Please confirm before executing' }),
            content: overwriteMsg,
            okText: $t({ defaultMessage: 'Yes' }),
            cancelText: $t({ defaultMessage: 'No' }),
            onOk: async () => {
              handleFinish(formData, gotoStep, true)
            },
            onCancel: async () => {}
          })
        } else {
          showActionModal({
            type: 'error',
            title: $t({ defaultMessage: 'Validation Error' }),
            content: <>
              {errorRes.data.errors.map((error, index) => <p key={index}>{error.message}</p>)}
            </>
          })
        }

        return Promise.reject()
      }
    }

    return Promise.resolve()
  }

  // eslint-disable-next-line max-len
  const doEdgeClusterValidation = async (payload: RequestPayload) => {
    try {
      await validateEdgePinClusterConfig({
        payload: {
          edgeClusterInfo: payload.edgeClusterInfo as EdgeClusterInfo
        }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      const errorRes = error as CatchErrorResponse

      if (errorRes.data.errors.length > 0) {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Validation Error' }),
          content: <>
            {errorRes.data.errors.map((error, index) => <p key={index}>{error.message}</p>)}
          </>
        })
      }

      return Promise.reject()
    }

    return Promise.resolve()
  }


  // eslint-disable-next-line max-len
  const handleFinish = async (formData: PersonalIdentityNetworkFormData, gotoStep: StepsFormGotoStepFn, skipValidation = false) => {
    const payload = getSubmitPayload(formData)

    try {
      await doEdgeClusterValidation(payload)
      await doSwitchValidation(formData, payload, gotoStep, skipValidation)
    } catch (error) {
      return
    }

    try {
      await new Promise(async (resolve, reject) => {
        const funcArgs = [{
          params, payload,
          callback: (result: CommonResult[] | CommonErrorsResult<CatchErrorDetails> ) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
            } else {
              reject(result)
            }

          }
          // need to catch basic service profile failed
        }] as unknown[]

        if (props.editMode) funcArgs.unshift(formInitialValues! as PersonalIdentityNetworkFormData)
        await props.onFinish.apply(null, funcArgs).catch(reject)
      })

      redirectPreviousPage(navigate, previousPath, linkToServices)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <StepsForm
      editMode={props.editMode}
      form={props.form}
      onCancel={() => redirectPreviousPage(navigate, previousPath, linkToServices)}
      onFinish={handleFinish}
      initialValues={formInitialValues}
      hasPrerequisiteStep={hasPrerequisite}
    >
      {
        props.steps.map((item, index) =>
          <StepsForm.StepForm
            key={`step-${index}`}
            name={index.toString()}
            title={$t(item.title)}
          >
            {item.content}
          </StepsForm.StepForm>)
      }
    </StepsForm>
  )
}

export const afterSubmitMessage = (
  error: CatchErrorResponse,
  allSwitches: { id: string, name?: string }[]
) => {
  const { $t } = getIntl()

  const errorMsg = error.data.errors[0].message //TODO: for each errors
  const webAuthVlanDNE = /\[WebAuth VLAN\]/.test(errorMsg)
  const forceOverwriteReboot = /\[forceOverwriteReboot\]/.test(errorMsg)
  const hasVXLAN = /VXLAN/i.test(errorMsg)

  const macRegexString = '([0-9a-fA-F][0-9a-fA-F]:){5}[0-9a-fA-F][0-9a-fA-F]'
  const macRegex = new RegExp(macRegexString, 'g')
  const macGroupRegex = new RegExp('\\[('+macRegexString+',? ?){1,}\\]', 'g')

  const switchIdList = errorMsg.match(macGroupRegex) as string[]

  const mapping: { [key: string]: string } = {}
  allSwitches.forEach(s=>{
    mapping[s.id] = s.name || s.id
  })

  const replaceMacWithName = (msg?: string) => {
    return msg ? msg.replace(macRegex, m => mapping[m] || m) : ''
  }

  let message: string[] = []
  if (forceOverwriteReboot && switchIdList.length > 0) {
    if (hasVXLAN) {
      message.push($t({ defaultMessage:
        'Distribution Switch {switchName} already has VXLAN config.' },
      { switchName: replaceMacWithName(switchIdList.shift()) }
      ))
    }
    if (switchIdList.length > 0) {
      message.push($t({ defaultMessage:
        'Distribution Switch {switchName} will reboot after set up forwarding profile.' },
      { switchName: replaceMacWithName(switchIdList.shift()) }
      ))
    }

    message.push($t({ defaultMessage: 'Click Yes to proceed, No to cancel.' }))
  } else if (webAuthVlanDNE) {
    message.push(replaceMacWithName(errorMsg))
  }
  return message.map(m=><p>{m}</p>)
}

export const getStepsByTopologyType = (type: string) => {
  const steps = [PrerequisiteStep, GeneralSettingsStep, NetworkTopologyStep, SmartEdgeStep]
  switch (type) {
    case NetworkTopologyType.Wireless:
      steps.push(WirelessNetworkStep, SummaryStep)
      break
    case NetworkTopologyType.TwoTier:
      steps.push(DistributionSwitchStep, AccessSwitchStep, SummaryStep)
      break
    case NetworkTopologyType.ThreeTier:
      steps.push(DistributionSwitchStep, AccessSwitchStep, WirelessNetworkStep, SummaryStep)
      break
  }
  return steps
}

export const getSubmitPayload = (formData: PersonalIdentityNetworkFormData) => {
  // `networkTopologyType` have value only when PIN enhancement FF is enabled
  const networkTopologyType = formData.networkTopologyType

  const payload = {
    id: formData.id,
    name: formData.name,
    vxlanTunnelProfileId: formData.vxlanTunnelProfileId,
    edgeClusterInfo: {
      edgeClusterId: formData.edgeClusterId,
      segments: formData.segments,
      dhcpInfoId: formData.dhcpId,
      dhcpPoolId: formData.poolId
    },
    networkIds: [] as string[],
    distributionSwitchInfos: [] as DistributionSwitch[],
    accessSwitchInfos: [] as AccessSwitch[]
  }

  if (networkTopologyType !== NetworkTopologyType.Wireless) {
    payload.distributionSwitchInfos = formData.distributionSwitchInfos?.map(ds => omit(
      ds, ['accessSwitches', 'name']))

    payload.accessSwitchInfos = formData.accessSwitchInfos?.map(as => omit(
      as, ['name', 'familyId', 'firmwareVersion', 'model']))
  }

  if (networkTopologyType !== NetworkTopologyType.TwoTier) {
    payload.networkIds = formData.networkIds
  }

  return payload
}