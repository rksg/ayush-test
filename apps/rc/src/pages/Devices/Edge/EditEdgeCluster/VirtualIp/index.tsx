import { useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'
import { useNavigate }    from 'react-router-dom'

import { Loader, StepsForm, showActionModal }                          from '@acx-ui/components'
import { EdgeClusterVirtualIpSettingForm, VipConfigType }              from '@acx-ui/rc/components'
import { useGetAllInterfacesByTypeQuery, usePatchEdgeClusterMutation } from '@acx-ui/rc/services'
import {
  EdgeCluster,
  EdgeClusterStatus,
  EdgePortTypeEnum,
  EdgeUrlsInfo,
  VirtualIpSetting
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'
import { EdgeScopes }    from '@acx-ui/types'
import { hasPermission } from '@acx-ui/user'
import { getOpsApi }     from '@acx-ui/utils'

import * as CommUI from '../styledComponents'


interface VirtualIpProps {
  currentClusterStatus?: EdgeClusterStatus
  currentVipConfig?: EdgeCluster['virtualIpSettings']
}

export interface VirtualIpFormType {
  timeout: number
  vipConfig: VipConfigType[]
}

export const defaultHaTimeoutValue = 6
const defaultVirtualIpFormValues = {
  timeout: defaultHaTimeoutValue,
  vipConfig: [{}]
} as VirtualIpFormType

export const VirtualIp = (props: VirtualIpProps) => {
  const { currentClusterStatus, currentVipConfig } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [patchEdgeCluster] = usePatchEdgeClusterMutation()
  const {
    data: lanInterfaces,
    isLoading: isLanInterfacesLoading
  } = useGetAllInterfacesByTypeQuery({
    payload: {
      edgeIds: currentClusterStatus?.edgeList?.map(node => node.serialNumber),
      portTypes: [EdgePortTypeEnum.LAN]
    }
  }, {
    skip: !currentClusterStatus?.edgeList || currentClusterStatus?.edgeList.length === 0
  })

  useEffect(() => {
    if(currentVipConfig) {
      const timeout = currentVipConfig.virtualIps?.[0]?.timeoutSeconds ?? defaultHaTimeoutValue
      const vipConfig = currentVipConfig.virtualIps?.map(item => ({
        vip: item.virtualIp,
        interfaces: item.ports
      })) ?? [{}]

      form.setFieldsValue({
        timeout,
        vipConfig
      })
    } else {
      form.setFieldsValue(defaultVirtualIpFormValues)
    }
  }, [currentVipConfig, lanInterfaces])

  const isSingleNode = (currentClusterStatus?.edgeList?.length ?? 0) < 2

  const handleFinish = async (values: VirtualIpFormType) => {
    try {
      const params = {
        venueId: currentClusterStatus?.venueId,
        clusterId: currentClusterStatus?.clusterId
      }
      const vipSettings = values.vipConfig.map(item => {
        if(!Boolean(item.interfaces) || Object.keys(item.interfaces).length === 0) return undefined
        return {
          virtualIp: item.vip,
          timeoutSeconds: values.timeout,
          ports: item.interfaces
        }
      }).filter(item => Boolean(item)) as VirtualIpSetting[]
      const payload = {
        virtualIpSettings: {
          virtualIps: vipSettings
        }
      }
      if(!isSingleNode && isVipConfigChanged(vipSettings.length === 0 ? undefined : vipSettings)) {
        showActionModal({
          type: 'confirm',
          title: $t({ defaultMessage: 'Warning' }),
          content: $t({
            defaultMessage: `Changing any virtual IP configurations might 
            temporarily cause network disruption and alter the active/backup roles
            of this cluster. Are you sure you want to continue?`
          }),
          onOk: async () => {
            await patchEdgeCluster({ params, payload }).unwrap()
          }
        })
      } else {
        await patchEdgeCluster({ params, payload }).unwrap()
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isVipConfigChanged = (vipSettings?: VirtualIpSetting[]) => {
    return !_.isEqual(vipSettings, currentVipConfig?.virtualIps)
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [getOpsApi(EdgeUrlsInfo.patchEdgeCluster)]
  })

  return (
    <Loader states={[{ isLoading: isLanInterfacesLoading }]}>
      <Row>
        <Col span={10}>
          <CommUI.Mt15>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Please select the node interfaces and assign virtual IPs for seamless failover :' })
            }
          </CommUI.Mt15>
          <StepsForm
            form={form}
            onFinish={handleFinish}
            onCancel={handleCancel}
            buttonLabel={{ submit: hasUpdatePermission ? $t({ defaultMessage: 'Apply' }) : '' }}
          >
            <StepsForm.StepForm>
              <CommUI.Mt15>
                <EdgeClusterVirtualIpSettingForm
                  currentClusterStatus={currentClusterStatus}
                  lanInterfaces={lanInterfaces
                    ? Object.fromEntries(Object.entries(lanInterfaces)
                      .map(([serial, portInfoList]) => [
                        serial,
                        portInfoList.map(portInfo => ({
                          ...portInfo,
                          interfaceName: portInfo.portName
                        }))
                      ]))
                    : undefined
                  }
                />
              </CommUI.Mt15>
            </StepsForm.StepForm>
          </StepsForm>
        </Col>
      </Row>
    </Loader>
  )
}
