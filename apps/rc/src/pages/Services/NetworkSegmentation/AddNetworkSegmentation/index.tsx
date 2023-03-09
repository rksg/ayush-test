
import _               from 'lodash'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageHeader, showActionModal, StepsFormNew, useStepFormContext } from '@acx-ui/components'
import { useCreateNetworkSegmentationGroupMutation }                     from '@acx-ui/rc/services'
import { CatchErrorResponse }                                            from '@acx-ui/rc/utils'
import { useTenantLink }                                                 from '@acx-ui/react-router-dom'
import { getIntl }                                                       from '@acx-ui/utils'

import { NetworkSegmentationGroupForm } from '../NetworkSegmentationForm'
import { AccessSwitchForm }             from '../NetworkSegmentationForm/AccessSwitchForm'
import { DistributionSwitchForm }       from '../NetworkSegmentationForm/DistributionSwitchForm'
import { GeneralSettingsForm }          from '../NetworkSegmentationForm/GeneralSettingsForm'
import { SmartEdgeForm }                from '../NetworkSegmentationForm/SmartEdgeForm'
import { SummaryForm }                  from '../NetworkSegmentationForm/SummaryForm'
import { WirelessNetworkForm }          from '../NetworkSegmentationForm/WirelessNetworkForm'


const AddNetworkSegmentation = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()
  const [createNetworkSegmentationGroup] = useCreateNetworkSegmentationGroupMutation()

  const steps = [
    {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettingsForm />
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: <SmartEdgeForm />
    },
    {
      title: $t({ defaultMessage: 'Wireless Network' }),
      content: <WirelessNetworkForm />
    },
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      content: <DistributionSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      content: <AccessSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const handleFinish = async (formData: NetworkSegmentationGroupForm) => {
    const payload = {
      name: formData.name,
      vxlanTunnelProfileId: formData.vxlanTunnelProfileId,
      venueInfos: [{
        venueId: formData.venueId
      }],
      edgeInfos: [{
        edgeId: formData.edgeId,
        segments: formData.segments,
        devices: formData.devices,
        dhcpInfoId: formData.dhcpId,
        dhcpPoolId: formData.poolId
      }],
      networkIds: formData.networkIds,
      distributionSwitchInfos: formData.distributionSwitchInfos.map(ds=>_.omit(
        ds, ['accessSwitches', 'name'])),
      accessSwitchInfos: formData.accessSwitchInfos.map(as=>_.omit(
        as, ['name', 'familyId', 'firmwareVersion', 'model'])),
      forceOverwriteReboot: formData.forceOverwriteReboot || false
    }
    try{
      await createNetworkSegmentationGroup({ payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: 'Please confirm before overwriting' }),
        content: afterSubmitMessage(error as CatchErrorResponse,
          [...formData.distributionSwitchInfos, ...formData.accessSwitchInfos]),
        okText: $t({ defaultMessage: 'Yes' }),
        cancelText: $t({ defaultMessage: 'No' }),
        onOk: async () => {
          formData.forceOverwriteReboot = true
          handleFinish(formData)
        },
        onCancel: async () => {}
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Network Segmentation Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsFormNew
        form={form}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleFinish}
        initialValues={{
          // Refactoring note:
          // Not sure if it make sense to have it as null,
          // setting it null end up causing warning on shouldn't use null for Select.
          // Will retain from its `defaultValue` usage,
          // so it remain the same as what was implemented
          venueId: null as unknown as NetworkSegmentationGroupForm['venueId'],
          // eslint-disable-next-line max-len
          vxlanTunnelProfileId: null as unknown as NetworkSegmentationGroupForm['vxlanTunnelProfileId']
        }}
      >
        {
          steps.map((item, index) =>
            <StepsFormNew.StepForm
              key={`step-${index}`}
              name={index.toString()}
              title={item.title}
            >
              {item.content}
            </StepsFormNew.StepForm>)
        }
      </StepsFormNew>
    </>
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

export default AddNetworkSegmentation
