/* eslint-disable max-len */
import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'

import { Drawer, PasswordInput }                                                                                                                                   from '@acx-ui/components'
import { Features }                                                                                                                                                from '@acx-ui/feature-toggle'
import { formatter }                                                                                                                                               from '@acx-ui/formatter'
import { useGetEdgePasswordDetailQuery }                                                                                                                           from '@acx-ui/rc/services'
import { EdgeClusterStatus, EdgeDnsServers, EdgeStatus, EdgeStatusEnum, EdgeUrlsInfo, isVirtualEdgeSerial, transformDisplayEnabledDisabled, transformDisplayText } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                                              from '@acx-ui/react-router-dom'
import { hasPermission, useUserProfileContext }                                                                                                                    from '@acx-ui/user'
import { getOpsApi }                                                                                                                                               from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import * as UI from './styledComponents'

interface EdgeDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentEdge: EdgeStatus | undefined,
  currentCluster: EdgeClusterStatus | undefined
  dnsServers: EdgeDnsServers | undefined
}


const EdgeDetailsDrawer = (props: EdgeDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentEdge, currentCluster, dnsServers } = props
  const { data: userProfile } = useUserProfileContext()

  const isShowEdgePassword = (userProfile?.support || userProfile?.var || userProfile?.dogfood)
  && hasPermission({ rbacOpsIds: [getOpsApi(EdgeUrlsInfo.getEdgePasswordDetail)] })
  const { data: passwordDetail } = useGetEdgePasswordDetailQuery(
    {
      params: {
        venueId: currentEdge?.venueId,
        edgeClusterId: currentEdge?.clusterId,
        serialNumber: currentEdge?.serialNumber
      }
    }, {
      skip: !visible || !isShowEdgePassword || !currentEdge
    }
  )

  const isEdgeHqosEnabled = useIsEdgeFeatureReady(Features.EDGE_QOS_TOGGLE)
  const isEdgeArptReady = useIsEdgeFeatureReady(Features.EDGE_ARPT_TOGGLE)

  const onClose = () => {
    setVisible(false)
  }

  const content = (
    <Form
      labelCol={{ span: 9 }}
      labelAlign='left'
      style={{ marginTop: currentEdge?.deviceStatus === EdgeStatusEnum.OPERATIONAL ? '25px' : 0 }}
    >
      <Form.Item
        label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
        children={
          <TenantLink to={`/venues/${currentEdge?.venueId}/venue-details/overview`}>
            {currentEdge?.venueName}
          </TenantLink>
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Cluster' })}
        children={
          currentCluster?.name || $t({ defaultMessage: 'None' })
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Description' })}
        children={
          currentEdge?.description || $t({ defaultMessage: 'None' })
        }
      />
      {/* <Form.Item
            label={$t({ defaultMessage: 'Tags' })}
            children={
              currentEdge?.tags || '--'
            }
          />
      */}

      <Divider/>

      <Form.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={
          transformDisplayText(currentEdge?.ip)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Primary DNS Server' })}
        children={
          transformDisplayText(dnsServers?.primary)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Secondary DNS Server' })}
        children={
          transformDisplayText(dnsServers?.secondary)
        }
      />


      {(isEdgeHqosEnabled || isEdgeArptReady) && <Divider/>}

      {isEdgeHqosEnabled && <Form.Item
        label={$t({ defaultMessage: 'Hierarchical QoS' })}
        children={
          transformDisplayEnabledDisabled(currentEdge?.isHqosEnabled??false)
        }
      />}

      {isEdgeArptReady && <Form.Item
        label={$t({ defaultMessage: 'ARP Termination' })}
        children={
          transformDisplayEnabledDisabled(currentEdge?.isArpTerminationEnabled??false)
        }
      />}

      <Divider/>

      <Form.Item
        label={$t({ defaultMessage: 'Model' })}
        children={
          currentEdge?.model || '###'
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Type' })}
        children={
          transformDisplayText(currentEdge?.type)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'FW Version' })}
        children={
          transformDisplayText(currentEdge?.firmwareVersion)
        }
      />
      {
        isShowEdgePassword &&
        <>
          <Form.Item
            label={$t({ defaultMessage: 'Login Password' })}
            children={
              <UI.DetailsPassword>
                <PasswordInput
                  readOnly
                  bordered={false}
                  value={passwordDetail?.loginPassword}
                />
              </UI.DetailsPassword>
            }
          />
          <Form.Item
            label={$t({ defaultMessage: 'Enable Password' })}
            children={
              <UI.DetailsPassword>
                <PasswordInput
                  readOnly
                  bordered={false}
                  value={passwordDetail?.enablePassword}
                />
              </UI.DetailsPassword>
            }
          />
        </>
      }
      <Form.Item
        label={$t({ defaultMessage: 'S/N' })}
        children={
          transformDisplayText(currentEdge?.serialNumber)
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'CPU' })}
        children={
          (currentEdge?.cpuCores ? `${currentEdge?.cpuCores} ${isVirtualEdgeSerial(currentEdge?.serialNumber) ? 'vCPUs' : 'CPUs'}` : '--' )
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Memory' })}
        children={
          (currentEdge?.memoryTotal
            ? formatter('bytesFormat')(currentEdge?.memoryTotal)
            : '--')
        }
      />
      <Form.Item
        label={$t({ defaultMessage: 'Storage' })}
        children={
          (currentEdge?.diskTotal
            ? formatter('bytesFormat')(currentEdge?.diskTotal)
            : '--')
        }
      />
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'RUCKUS Edge Details' })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'480px'}
    />
  )
}

export default EdgeDetailsDrawer
