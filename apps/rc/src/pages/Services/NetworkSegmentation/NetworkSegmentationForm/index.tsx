import React, { useEffect } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, showActionModal, StepsFormNew } from '@acx-ui/components'
import {
  useCreateNetworkSegmentationGroupMutation,
  useGetNetworkSegmentationGroupByIdQuery,
  useUpdateNetworkSegmentationGroupMutation
} from '@acx-ui/rc/services'
import { AccessSwitch, CatchErrorResponse, NetworkSegmentationGroup } from '@acx-ui/rc/utils'
import { useTenantLink }                                              from '@acx-ui/react-router-dom'
import { getIntl }                                                    from '@acx-ui/utils'

import { AccessSwitchForm }       from './AccessSwitchForm'
import { DistributionSwitchForm } from './DistributionSwitchForm'
import { GeneralSettingsForm }    from './GeneralSettingsForm'
import { SmartEdgeForm }          from './SmartEdgeForm'
import { SummaryForm }            from './SummaryForm'
import { WirelessNetworkForm }    from './WirelessNetworkForm'


export interface NetworkSegmentationGroupForm extends NetworkSegmentationGroup {
  venueId: string
  venueName: string
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
  networkNames: string[],
  originalAccessSwitchInfos: AccessSwitch[]
}

export default function NetworkSegmentationForm ({ editMode = false }: { editMode?: boolean }) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')

  const [form] = Form.useForm()
  const [createNetworkSegmentationGroup] = useCreateNetworkSegmentationGroupMutation()
  const [updateNetworkSegmentationGroup] = useUpdateNetworkSegmentationGroupMutation()
  const { data: nsgData } = useGetNetworkSegmentationGroupByIdQuery({ params }, { skip: !editMode })

  const steps = [{
    title: $t({ defaultMessage: 'General Settings' }),
    content: <GeneralSettingsForm editMode={editMode} />
  }, {
    title: $t({ defaultMessage: 'SmartEdge' }),
    content: <SmartEdgeForm />
  }, {
    title: $t({ defaultMessage: 'Wireless Network' }),
    content: <WirelessNetworkForm />
  }, {
    title: $t({ defaultMessage: 'Dist. Switch' }),
    content: <DistributionSwitchForm />
  }, {
    title: $t({ defaultMessage: 'Access Switch' }),
    content: <AccessSwitchForm />
  }]
  if (!editMode) {
    steps.push({
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    })
  }

  useEffect(() => {
    form.resetFields()
    if(nsgData && editMode) {
      form.setFieldValue('name', nsgData.name)
      // form.setFieldValue('tags', nsgData.ta)
      form.setFieldValue('venueId', nsgData.venueInfos[0]?.venueId)
      form.setFieldValue('edgeId', nsgData.edgeInfos[0]?.edgeId)
      form.setFieldValue('segments', nsgData.edgeInfos[0]?.segments)
      form.setFieldValue('devices', nsgData.edgeInfos[0]?.devices)
      form.setFieldValue('dhcpId', nsgData.edgeInfos[0]?.dhcpInfoId)
      form.setFieldValue('poolId', nsgData.edgeInfos[0]?.dhcpPoolId)
      form.setFieldValue('vxlanTunnelProfileId', nsgData.vxlanTunnelProfileId)
      form.setFieldValue('networkIds', nsgData.networkIds)
      form.setFieldValue('distributionSwitchInfos', nsgData.distributionSwitchInfos)
      form.setFieldValue('accessSwitchInfos', nsgData.accessSwitchInfos)
      form.setFieldValue('originalAccessSwitchInfos', nsgData.accessSwitchInfos)
    }
  }, [nsgData, editMode])

  const handleFinish = async (formData: NetworkSegmentationGroupForm) => {
    const payload = {
      id: formData.id,
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
    try {
      if (editMode) {
        await updateNetworkSegmentationGroup({ params, payload: payload }).unwrap()
      } else {
        await createNetworkSegmentationGroup({ params, payload: payload }).unwrap()
      }
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

  return (<>
    <PageHeader
      title={editMode ?
        $t({ defaultMessage: 'Edit Network Segmentation Service' }) :
        $t({ defaultMessage: 'Add Network Segmentation Service' })
      }
      breadcrumb={[
        { text: $t({ defaultMessage: 'Services' }), link: '/services' }
      ]}
    />
    <StepsFormNew editMode={editMode}
      form={form}
      onCancel={() => navigate(linkToServices)}
      onFinish={handleFinish}
      initialValues={{
        // Refactoring note:
        // Not sure if it make sense to have it as null,
        // setting it null end up causing warning on shouldn't use null for Select.
        // Will retain from its `defaultValue` usage,
        // so it remain the same as what was implemented
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
  </>)
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
