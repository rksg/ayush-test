import { useEffect, useState } from 'react'

import { Divider, Form, Select } from 'antd'
import { replace }               from 'lodash'
import _                         from 'lodash'
import { useIntl }               from 'react-intl'

import { Drawer, PasswordInput }  from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  SwitchViewModel,
  getSwitchModel,
  getStackMemberStatus
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
  const enableSwitchAdminPassword = useIsSplitOn(Features.SWITCH_ADMIN_PASSWORD)

  const parserUnitDetialsData = (count = 0) => {
    const unitDetails = switchDetail?.unitDetails && switchDetail?.unitDetails[count]
    const targetDevice = isStack ? unitDetails : switchDetail
    const model = _.isEmpty(_.get(targetDevice, 'model')) ?
      getSwitchModel(targetDevice?.activeSerial || '') : _.get(targetDevice, 'model')
    setUnitDetial({
      serialNumber: targetDevice?.activeSerial || '',
      model: model || '',
      stackMembership: _.get(targetDevice, 'unitStatus'),
      stackId: _.get(targetDevice, 'unitId'),
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
    return replace(dns, /,/g, '\r\n')
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
          label={$t({ defaultMessage: 'Venue' })}
          children={
            <TenantLink to={`/venues/${switchDetail.venueId}/venue-details/overview`}>
              {switchDetail.venueName}
            </TenantLink>
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description' })}
          children={switchDetail.venueDescription || $t({ defaultMessage: 'None' })}
        />
        <Divider/>
        { enableSwitchAdminPassword && <Form.Item
          label={$t({ defaultMessage: 'Admin Password' })}
          children={
            !switchDetail?.configReady
              ? '--'
              : (switchDetail.syncedAdminPassword ? <PasswordInput
                style={{ paddingLeft: 0 }}
                readOnly
                bordered={false}
                value={'1testtttttggfdgfdgfdgvcvcvxcvdfsdfsd9'} /> //TODO
                : $t({ defaultMessage: 'Custom' })
              )
          }
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
