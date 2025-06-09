import React from 'react'

import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Card }                                   from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { DeviceComplianceType, LicenseCardProps } from '@acx-ui/msp/utils'
import { TrialType }                              from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function DeviceNetworkingCard (props: LicenseCardProps) {
  const { $t } = useIntl()
  const { title, subTitle, data, isMsp, trialType, footerContent } = props
  const iotFFToggle = useIsSplitOn(Features.ENTITLEMENT_IOT_CTRL_TOGGLE)

  const wifiData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.WIFI)
  const switchData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.SWITCH)
  const virtualEdgeData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.VIRTUAL_EDGE)
  const rwgData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.RWG)
  const iotCtrlData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.IOT_CTRL)

  return <Col style={{ width: '385px', paddingLeft: 0, marginTop: '15px' }}>
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        height: '100%'
      }}>
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            marginBottom: '10px' }}>
            <div style={{ flexDirection: 'column', marginTop: '4px' }}>
              <UI.Title>{title}</UI.Title>
              <UI.SubTitle>{subTitle}</UI.SubTitle>
            </div>
            { data.licenseGap >= 0 ? <UI.GreenTickIcon /> : <UI.RedTickIcon />}
          </div>

          <UI.FieldLabelSubs width='275px'
            style={{ fontWeight: '600', paddingBottom: '10px', borderBottom: '1px solid #02a7f0' }}>
            <label>{$t({ defaultMessage: 'Devices' })}</label>
            <label>{$t({ defaultMessage: 'Configured' })}</label>
            <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
          </UI.FieldLabelSubs>

          <UI.FieldLabelSubs width='275px' style={{ marginTop: '10px' }}>
            <label>{$t({ defaultMessage: 'Access Points' })}</label>
            <label>{wifiData?.installedDeviceCount}</label>
            <label>{wifiData?.usedLicenseCount}</label>
          </UI.FieldLabelSubs>
          <UI.FieldLabelSubs width='275px'>
            <label>{$t({ defaultMessage: 'Switches' })}</label>
            <label>{switchData?.installedDeviceCount}</label>
            <label>{switchData?.usedLicenseCount}</label>
          </UI.FieldLabelSubs>
          <UI.FieldLabelSubs width='275px'>
            <label>{$t({ defaultMessage: 'RUCKUS Edge vAppliances' })}</label>
            <label>{virtualEdgeData?.installedDeviceCount}</label>
            <label>{virtualEdgeData?.usedLicenseCount}</label>
          </UI.FieldLabelSubs>
          <UI.FieldLabelSubs width='275px'
            style={!iotFFToggle ?
              { paddingBottom: '15px', borderBottom: '1px solid var(--acx-accents-blue-30)' } : {}}>
            <label>{$t({ defaultMessage: 'RWGs' })}</label>
            <label>{rwgData?.installedDeviceCount}</label>
            <label>{rwgData?.usedLicenseCount}</label>
          </UI.FieldLabelSubs>
          { iotFFToggle && <UI.FieldLabelSubs width='275px'
            style={{ paddingBottom: '15px', borderBottom: '1px solid var(--acx-accents-blue-30)' }}>
            <label>{$t({ defaultMessage: 'IoT Controllers' })}</label>
            <label>{iotCtrlData?.installedDeviceCount}</label>
            <label>{iotCtrlData?.usedLicenseCount}</label>
          </UI.FieldLabelSubs> }

          <UI.FieldLabelSubs2 width='275px' style={{ marginTop: '15px' }}>
            <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
            <label>{data.totalActivePaidLicenseCount}</label>
            {data.totalActivePaidLicenseCount > 0 &&
              <label style={{ textAlign: 'left', marginLeft: '10px', color: '#ec7100' }}>
                {`(${data.nextTotalPaidExpiringLicenseCount} ${$t({ defaultMessage: 'expire on' })} 
                ${data.nextPaidExpirationDate})`}</label>}
          </UI.FieldLabelSubs2>
          {trialType && <UI.FieldLabelSubs2 width='275px'>
            <label>{trialType === TrialType.EXTENDED_TRIAL
              ? $t({ defaultMessage: 'Active Extended Trial Licenses' })
              : $t({ defaultMessage: 'Active Trial Licenses' })}</label>
            <label>{data.totalActiveTrialLicenseCount}</label>
            {data.totalActiveTrialLicenseCount > 0 &&
              <label style={{ textAlign: 'left', marginLeft: '10px', color: '#ec7100' }}>
                {`(${data.nextTotalTrialExpiringLicenseCount}
                ${$t({ defaultMessage: 'expire on' })} 
                ${data.nextTrialExpirationDate})`}</label>}
          </UI.FieldLabelSubs2>}

          {isMsp && <div>
            <UI.FieldLabelSubs2 width='275px'>
              <label>{$t({ defaultMessage: 'Assigned Paid Licenses' })}</label>
              <label>{data.totalActivePaidAssignedLicenseCount}</label>
            </UI.FieldLabelSubs2>
            <UI.FieldLabelSubs2 width='275px'>
              <label>{$t({ defaultMessage: 'Assigned Trial Licenses' })}</label>
              <label>{data.totalActiveTrialAssignedLicenseCount}</label>
            </UI.FieldLabelSubs2>
          </div>}
          <UI.FieldLabelSubs2 style={{ marginTop: '10px' }} width='275px'>
            <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
            <label>{data.licensesUsed}</label>
          </UI.FieldLabelSubs2>
          <UI.FieldLabelSubs2 width='275px'>
            <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
            <label>
              {data.licenseGap >= 0
                ? <UI.LicenseAvailable>{data.licenseGap}</UI.LicenseAvailable>
                : <UI.LicenseGap>{data.licenseGap}</UI.LicenseGap>}</label>
          </UI.FieldLabelSubs2>
        </div>
        { footerContent }
      </div>
    </Card>
  </Col>
}