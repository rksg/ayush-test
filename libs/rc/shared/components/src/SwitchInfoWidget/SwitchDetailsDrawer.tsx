import { useEffect, useState } from 'react'

import { Divider, Form, Select } from 'antd'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Drawer, PasswordInput }   from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import {
  SwitchViewModel,
  getAdminPassword,
  getSwitchModel,
  getStackMemberStatus,
  isFirmwareSupportAdminPassword
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

export interface DrawerProps {
  visible: boolean
  onClose: () => void
  switchDetail: SwitchViewModel
}

export const SwitchDetailsDrawer = (props: DrawerProps) => {
  const { $t } = useIntl()
  const { switchDetail } = props
  const [ unitDetial, setUnitDetial] = useState({
    serialNumber: '',
    model: '',
    stackMembership: '',
    stackId: '',
    fwVersion: ''
  })

  const isStack = !!(switchDetail.isStack || switchDetail.formStacking)
  const enableSwitchExternalIp = useIsSplitOn(Features.SWITCH_EXTERNAL_IP_TOGGLE)
  const isSupportAdminPassword = isFirmwareSupportAdminPassword(switchDetail.firmware || '')
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)
  const isSupport8200AV = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8200AV)
  const isSupport8100X = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100X)
  const isSupport7550Zippy = useIsSplitOn(Features.SWITCH_SUPPORT_ICX7550Zippy)

  const parserUnitDetialsData = (count = 0) => {
    const unitDetails = switchDetail?.unitDetails && switchDetail?.unitDetails[count]
    const targetDevice = isStack ? unitDetails : switchDetail
    const model = _.isEmpty(_.get(targetDevice, 'model')) ?
      getSwitchModel(targetDevice?.activeSerial || '') : _.get(targetDevice, 'model')
    setUnitDetial({
      serialNumber: targetDevice?.activeSerial || '',
      model: model || '',
      stackMembership: _.get(targetDevice, 'unitStatus'),
      stackId: targetDevice?.unitId ? String(targetDevice.unitId) : '1',
      fwVersion: switchDetail.firmware || ''
    })
  }

  useEffect(() => {
    if (switchDetail) {
      parserUnitDetialsData()
    }
  }, [switchDetail])
  const ipAssignmentParser = (ipAssignment: string) => {
    return ipAssignment === 'static' ? $t({ defaultMessage: 'Static' })
      : $t({ defaultMessage: 'Dynamic (DHCP)' })
  }
  const dnsParser = (dns:string) => {
    const dnsList = dns.split(',').slice(0, 4)
    return (<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {dnsList.map((val) => <li key={val}>{val}</li>)}</ul>)
  }
  return <Drawer
    width={'450px'}
    title={isStack ? $t({ defaultMessage: 'Stack Details' })
      : $t({ defaultMessage: 'Switch Details' })}
    visible={props.visible}
    onClose={props.onClose}
    children={
      <Form labelCol={{ span: 10 }} labelAlign='left'>
        <Form.Item
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
          children={
            <TenantLink to={`/venues/${switchDetail.venueId}/venue-details/overview`}>
              {switchDetail.venueName}
            </TenantLink>
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description' })}
          children={switchDetail.description || $t({ defaultMessage: 'None' })}
        />
        <Divider/>
        { isSupportAdminPassword && <Form.Item
          label={$t({ defaultMessage: 'Admin Password' })}
          children={getAdminPassword(
            switchDetail,
            {
              isSupport8200AV: isSupport8200AV,
              isSupport8100: isSupport8100,
              isSupport8100X: isSupport8100X,
              isSupport7550Zippy: isSupport7550Zippy
            },
            PasswordInput)}
        />}
        <Form.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={switchDetail.switchMac || noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'IP Assignment' })}
          children={switchDetail.staticOrDynamic ?
            ipAssignmentParser(switchDetail.staticOrDynamic) : noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={switchDetail.ipAddress || noDataDisplay}
        />
        { enableSwitchExternalIp && <Form.Item
          label={$t({ defaultMessage: 'Ext. IP Address' })}
          children={switchDetail.extIp || noDataDisplay}
        />}
        <Form.Item
          label={$t({ defaultMessage: 'Subnet Mask' })}
          children={switchDetail.subnetMask || noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Default Gateway' })}
          children={switchDetail.defaultGateway || noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'DNS Server' })}
          children={switchDetail.dns ? dnsParser(switchDetail.dns) : noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'Uptime' })}
          children={switchDetail.uptime || noDataDisplay}
        />
        <Divider/>
        {
          isStack && (
            <>
              <Form.Item
                label={$t({ defaultMessage: 'Stack member details' })}
                children={
                  <Select
                    defaultValue={0}
                    onChange={event => parserUnitDetialsData(event)}
                    options={switchDetail?.unitDetails?.map((unit, index) => {
                      const stackRole = unit.unitStatus ?
                        getStackMemberStatus(unit.unitStatus)
                        : $t({ defaultMessage: 'Unknown Role' })
                      const stackUnitId = unit.unitId ? unit.unitId : unit.activeSerial
                      return({
                        value: index,
                        label: stackUnitId + ' (' + stackRole + ')'
                      })
                    })}
                  />
                }
              />
              <Form.Item
                label={$t({ defaultMessage: 'Stack membership' })}
                children={getStackMemberStatus(unitDetial.stackMembership) || noDataDisplay}
              />
              <Form.Item
                label={$t({ defaultMessage: 'Stack ID' })}
                children={unitDetial.stackId || noDataDisplay}
              />
            </>
          )
        }
        <Form.Item
          label={$t({ defaultMessage: 'Model' })}
          children={unitDetial.model || noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'FW Version' })}
          children={unitDetial.fwVersion || noDataDisplay}
        />
        <Form.Item
          label={$t({ defaultMessage: 'S/N' })}
          children={unitDetial.serialNumber || noDataDisplay}
        />
      </Form>
    }
  />
}
