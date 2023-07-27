import { ReactNode } from 'react'

import { FormInstance }                        from 'antd'
import _                                       from 'lodash'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { showActionModal, StepsForm } from '@acx-ui/components'
import {
  AccessSwitch,
  CatchErrorResponse,
  getServiceListRoutePath,
  LocationExtended,
  NetworkSegmentationGroup,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }       from '@acx-ui/utils'

interface NetworkSegmentationFormProps {
  editMode?: boolean
  form?: FormInstance
  onFinish: Function
  initialValues?: Object
  steps: NetworkSegmentationFormStep[]
}

interface NetworkSegmentationFormStep {
  title: string
  content: ReactNode
}

export interface NetworkSegmentationGroupFormData extends NetworkSegmentationGroup {
  venueId: string
  venueName: string
  personaGroupId: string
  edgeId: string
  edgeName: string
  dhcpId: string
  dhcpName: string
  poolId: string
  poolName: string
  tags: string[]
  segments: number
  devices: number
  tunnelProfileName: string
  networkNames: string[]
  originalAccessSwitchInfos: AccessSwitch[]
  dhcpRelay: boolean
}

export const NetworkSegmentationForm = (props: NetworkSegmentationFormProps) => {

  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const linkToServices = useTenantLink(getServiceListRoutePath(true))
  const previousPath = (location as LocationExtended)?.state?.from?.pathname

  const handleFinish = async (formData: NetworkSegmentationGroupFormData) => {
    const payload = {
      id: formData.id,
      name: formData.name,
      vxlanTunnelProfileId: formData.vxlanTunnelProfileId,
      venueInfos: [{
        venueId: formData.venueId,
        personaGroupId: formData.personaGroupId
      }],
      edgeInfos: [{
        edgeId: formData.edgeId,
        segments: formData.segments,
        devices: formData.devices,
        dhcpInfoId: formData.dhcpId,
        dhcpPoolId: formData.poolId
      }],
      networkIds: formData.networkIds,
      distributionSwitchInfos: formData.distributionSwitchInfos?.map(ds=>_.omit(
        ds, ['accessSwitches', 'name'])),
      accessSwitchInfos: formData.accessSwitchInfos?.map(as=>_.omit(
        as, ['name', 'familyId', 'firmwareVersion', 'model'])),
      forceOverwriteReboot: formData.forceOverwriteReboot || false
    }
    try {
      await props.onFinish({ params, payload: payload }).unwrap()
      redirectPreviousPage(navigate, previousPath, linkToServices)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      const overwriteMsg = afterSubmitMessage(error as CatchErrorResponse,
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
            formData.forceOverwriteReboot = true
            handleFinish(formData)
          },
          onCancel: async () => {}
        })
      } else {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Server Error' }),
          content: $t({
            defaultMessage: 'An internal error has occurred. Please contact support.'
          }),
          customContent: {
            action: 'SHOW_ERRORS',
            errorDetails: error as CatchErrorResponse
          }
        })
      }
    }
  }

  return (
    <StepsForm editMode={props.editMode}
      form={props.form}
      onCancel={() => redirectPreviousPage(navigate, previousPath, linkToServices)}
      onFinish={handleFinish}
      initialValues={props.initialValues}
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
