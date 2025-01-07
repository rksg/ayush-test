import { ReactNode } from 'react'

import { FormInstance }                        from 'antd'
import { omit }                                from 'lodash'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { showActionModal, StepsForm, StepsFormGotoStepFn }                            from '@acx-ui/components'
import { useValidateEdgePinNetworkMutation, useValidateEdgePinClusterConfigMutation } from '@acx-ui/rc/services'
import {
  CatchErrorResponse,
  CommonErrorsResult,
  CommonResult,
  CatchErrorDetails,
  getServiceListRoutePath,
  LocationExtended,
  PersonalIdentityNetworkFormData,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }       from '@acx-ui/utils'

interface PersonalIdentityNetworkFormProps {
  editMode?: boolean
  form?: FormInstance
  onFinish: Function
  initialValues?: Object
  steps: PersonalIdentityNetworkFormStep[]
}

interface PersonalIdentityNetworkFormStep {
  title: string
  content: ReactNode
}

export const PersonalIdentityNetworkForm = (props: PersonalIdentityNetworkFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { initialValues: formInitialValues } = props
  const linkToServices = useTenantLink(getServiceListRoutePath(true))
  const previousPath = (location as LocationExtended)?.state?.from?.pathname

  const doSwitchValidation = useSwitchValidator()
  const doEdgeClusterValidation = useEdgeClusterValidator()

  // eslint-disable-next-line max-len
  const handleFinish = async (formData: PersonalIdentityNetworkFormData, gotoStep: StepsFormGotoStepFn, skipValidation = false) => {
    const payload = {
      id: formData.id,
      name: formData.name,
      vxlanTunnelProfileId: formData.vxlanTunnelProfileId,
      edgeClusterInfo: {
        edgeClusterId: formData.edgeClusterId,
        segments: formData.segments,
        devices: formData.devices,
        dhcpInfoId: formData.dhcpId,
        dhcpPoolId: formData.poolId
      },
      networkIds: formData.networkIds,
      distributionSwitchInfos: formData.distributionSwitchInfos?.map(ds => omit(
        ds, ['accessSwitches', 'name'])),
      accessSwitchInfos: formData.accessSwitchInfos?.map(as => omit(
        as, ['name', 'familyId', 'firmwareVersion', 'model']))
    }

    try {
      await doEdgeClusterValidation(payload, gotoStep)
      await doSwitchValidation(formData, gotoStep, skipValidation)
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
    >
      {
        props.steps.map((item, index) =>
          <StepsForm.StepForm
            key={`step-${index}`}
            name={index.toString()}
            title={item.title}
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

const useSwitchValidator = () => {
  const [validateEdgePinNetwork] = useValidateEdgePinNetworkMutation()

  // eslint-disable-next-line max-len
  return async (formData: PersonalIdentityNetworkFormData, gotoStep: StepsFormGotoStepFn, skipValidation = false) => {
    if (formData.distributionSwitchInfos?.length > 0 && (
      formData.accessSwitchInfos.length === 0 || !formData.accessSwitchInfos.every(as =>
        as.vlanId && as.uplinkInfo?.uplinkId && as.webAuthPageType)
    )) {
      gotoStep(4)
      return
    }

    if (!skipValidation &&
    formData.distributionSwitchInfos?.length > 0 && formData.accessSwitchInfos?.length > 0) {
      try {
        await validateEdgePinNetwork({
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
  }
}
// eslint-disable-next-line max-len
const useEdgeClusterValidator = () => {
  const [validateEdgePinClusterConfig] = useValidateEdgePinClusterConfigMutation()

  return async (payload: PersonalIdentityNetworkFormData) => {
    try {
      await validateEdgePinClusterConfig({
        payload: {
          edgeClusterInfo: payload.edgeClusterInfo
        }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      const errorRes = error as CatchErrorResponse

      // expected error format
      // eslint-disable-next-line max-len
      if (errorRes.data.errors.length > 0 && errorRes.data.errors[0].code === 'PERSONAL-IDENTITY-NETWORK-10004') {
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
}