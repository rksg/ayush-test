import { useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'
import { useNavigate }    from 'react-router-dom'

import { Loader, StepsForm }                                           from '@acx-ui/components'
import { EdgeClusterVirtualIpSettingForm }                             from '@acx-ui/rc/components'
import { useGetAllInterfacesByTypeQuery, usePatchEdgeClusterMutation } from '@acx-ui/rc/services'
import {
  EdgeCluster,
  EdgeClusterStatus,
  EdgePortInfo,
  EdgePortTypeEnum
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import * as CommUI from '../styledComponents'

interface VirtualIpProps {
  currentClusterStatus?: EdgeClusterStatus
  currentVipConfig?: EdgeCluster['virtualIpSettings']
}

export interface VirtualIpConfigFormType {
    interfaces: {
      [key: string]: EdgePortInfo
    }
    vip: string
}
export interface VirtualIpFormType {
  timeout: number
  vipConfig: VirtualIpConfigFormType[]
}

export const defaultHaTimeoutValue = 3
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
      const editVipConfig = [] as VirtualIpFormType['vipConfig']
      if(lanInterfaces) {
        for(let i=0; i<currentVipConfig.virtualIps.length; i++) {
          const currentConfig = currentVipConfig.virtualIps[i]
          const interfaces = {} as { [key: string]: EdgePortInfo }
          for(let config of currentConfig.ports) {
            const tmp = lanInterfaces?.[config.serialNumber].find(item =>
              item.portName === config.portName)
            interfaces[config.serialNumber] = tmp || {} as EdgePortInfo
          }
          editVipConfig.push({
            vip: currentConfig.virtualIp,
            interfaces
          })
        }
      }

      form.setFieldsValue({
        timeout,
        vipConfig: editVipConfig
      })
    } else {
      form.setFieldsValue(defaultVirtualIpFormValues)
    }
  }, [currentVipConfig, lanInterfaces])

  const handleFinish = async (values: VirtualIpFormType) => {
    try {
      const params = {
        venueId: currentClusterStatus?.venueId,
        clusterId: currentClusterStatus?.clusterId
      }
      const vipSettings = values.vipConfig.map(item => {
        const ports = Object.entries(item.interfaces).map(([, v2]) => {
          return {
            serialNumber: v2.serialNumber,
            portName: v2.portName
          }
        })
        return {
          virtualIp: item.vip,
          timeoutSeconds: values.timeout,
          ports
        }
      })
      const payload = {
        virtualIpSettings: {
          virtualIps: vipSettings
        }
      }
      await patchEdgeCluster({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

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
            buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
          >
            <StepsForm.StepForm>
              <CommUI.Mt15>
                <EdgeClusterVirtualIpSettingForm
                  currentClusterStatus={currentClusterStatus}
                  lanInterfaces={lanInterfaces}
                />
              </CommUI.Mt15>
            </StepsForm.StepForm>
          </StepsForm>
        </Col>
      </Row>
    </Loader>
  )
}
