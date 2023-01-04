/* eslint-disable max-len */
import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, Drawer }     from '@acx-ui/components'
import { EdgeDNS, EdgePortStatus, EdgeStatus, EdgeStatusEnum } from '@acx-ui/rc/utils'
import { TenantLink }                                        from '@acx-ui/react-router-dom'


import { EdgeDetailsSettingsInfo } from './EdgeDetailsSettingsInfo'

interface EdgeDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentEdge: EdgeStatus,
  edgePortsSetting: EdgePortStatus[]
}

const EdgeDetailsDrawer = (props: EdgeDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentEdge, edgePortsSetting } = props

  const dnsSetting: EdgeDNS = currentEdge?.dns1 || ''

  const onClose = () => {
    setVisible(false)
  }

  const PropertiesTab = () => {
    return (
      <Form
        labelCol={{ span: 12 }}
        labelAlign='left'
        style={{ marginTop: currentEdge?.deviceStatus === EdgeStatusEnum.OPERATIONAL ? '25px' : 0 }}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Venue' })}
          children={
            <TenantLink to={`/venues/${currentEdge?.venueId}/venue-details/overview`}>
              {currentEdge?.venueName}
            </TenantLink>
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description' })}
          children={
            currentEdge?.description || $t({ defaultMessage: 'None' })
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Tags' })}
          children={
            currentEdge?.tags || '--'
          }
        />

        <Divider/>

        <Form.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            currentEdge?.ip || '--'
          }
        />

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
            currentEdge?.type || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'FW Version' })}
          children={
            currentEdge?.fwVersion || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'S/N' })}
          children={
            currentEdge?.serialNumber || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'CPU' })}
          children={
            currentEdge?.cpuUsed || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Memory' })}
          children={
            currentEdge?.memUsed || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Storage' })}
          children={
            currentEdge?.diskUsed || '--'
          }
        />

      </Form>
    )
  }


  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Properties' }),
      value: 'properties',
      children: <PropertiesTab />
    },
    {
      label: $t({ defaultMessage: 'Settings' }),
      value: 'settings',
      children: <EdgeDetailsSettingsInfo
        edgePortsSetting={edgePortsSetting as EdgePortStatus[]}
        dnsSetting={dnsSetting as EdgeDNS}
      />
    }
  ]

  const content = <ContentSwitcher tabDetails={tabDetails} size='small' />

  return (
    <Drawer
      title={$t({ defaultMessage: 'SmartEdge Details' })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'400px'}
    />
  )
}


export default EdgeDetailsDrawer