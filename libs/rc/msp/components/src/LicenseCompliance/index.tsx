import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Card }                               from '@acx-ui/components'
import { useGetEntitlementsCompliancesQuery } from '@acx-ui/msp/services'
import { ComplianceData }                     from '@acx-ui/msp/utils'
import { useParams }                          from '@acx-ui/react-router-dom'

import { fakeMspSummary } from './__tests__/fixtures'
import * as UI            from './styledComponents'

interface LicenseCardProps {
  title: string
  subTitle: string
  data: ComplianceData
  isMsp: boolean
}

const DeviceNetworkingCard = (props: LicenseCardProps) => {
  const { $t } = useIntl()
  const { title, subTitle, data, isMsp } = props

  return <Col style={{ width: '425px', paddingLeft: 0, marginTop: '15px' }}>
    <Card>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: '10px' }}>
        <div style={{ flexDirection: 'column', marginTop: '4px' }}>
          <UI.Title>{$t({ defaultMessage: '{title}' }, { title })}</UI.Title>
          <UI.SubTitle>{$t({ defaultMessage: '{subTitle}' }, { subTitle })}</UI.SubTitle>
        </div>
        { data.licenseGap >= 0 ? <UI.GreenTickIcon /> : <UI.RedTickIcon />}
      </div>

      <UI.FieldLabelSubs width='275px'
        style={{ fontWeight: '600', paddingBottom: '10px', borderBottom: '1px solid #02a7f0' }}>
        <label>{$t({ defaultMessage: 'Devices' })}</label>
        <label style={{ textAlign: 'center' }}>
          {$t({ defaultMessage: 'Configured' })}</label>
        <label style={{ textAlign: 'center' }}>
          {$t({ defaultMessage: 'Licenses Used' })}</label>
      </UI.FieldLabelSubs>

      <UI.FieldLabelSubs width='275px' style={{ marginTop: '10px' }}>
        <label>{$t({ defaultMessage: 'Access Points' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.WIFI.installedDeviceCount}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.WIFI.usedLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'Switches' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.SWITCH.installedDeviceCount}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.SWITCH.usedLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'SmartEdge vAppliances' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.VIRTUAL_EDGE.installedDeviceCount}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.VIRTUAL_EDGE.usedLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'SmartEdge HW Appliances' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.EDGE.installedDeviceCount}</label>
        <label style={{ textAlign: 'center' }}>
          {data.deviceCompliances.EDGE.usedLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'RWGs' })}</label>
        <label style={{ textAlign: 'center' }}>{'--'}</label>
        <label style={{ textAlign: 'center' }}>{'--'}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'
        style={{ paddingBottom: '15px', borderBottom: '1px solid #02a7f0' }}>
        <label>{$t({ defaultMessage: 'SmartZones' })}</label>
        <label style={{ textAlign: 'center' }}>{'--'}</label>
        <label style={{ textAlign: 'center' }}>{'--'}</label>
      </UI.FieldLabelSubs>

      <UI.FieldLabelSubs2 width='275px' style={{ marginTop: '15px' }}>
        <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
        <label style={{ textAlign: 'right', fontWeight: '600' }}>
          {data.totalActivePaidLicenseCount}</label>
        <label style={{ textAlign: 'left', marginLeft: '10px', color: '#ec7100' }}>
          {`(${data.nextTotalPaidExpiringLicenseCount} ${$t({ defaultMessage: 'expire on' })} 
          ${data.nextPaidExpirationDate})`}</label>
      </UI.FieldLabelSubs2>
      <UI.FieldLabelSubs2 width='275px'>
        <label>{$t({ defaultMessage: 'Active Trial Licenses' })}</label>
        <label style={{ textAlign: 'right', fontWeight: '600' }}>
          {data.totalActiveTrialLicenseCount}</label>
        <label style={{ textAlign: 'left', marginLeft: '10px', color: '#ec7100' }}>
          {`(${data.nextTotalTrialExpiringLicenseCount} ${$t({ defaultMessage: 'expire on' })} 
          ${data.nextTrialExpirationDate})`}</label>
      </UI.FieldLabelSubs2>

      {isMsp && <div>
        <UI.FieldLabelSubs2 width='275px'>
          <label>{$t({ defaultMessage: 'Active Paid Assigned Licenses' })}</label>
          <label style={{ textAlign: 'right', fontWeight: '600' }}>
            {data.totalActivePaidAssignedLicenseCount}</label>
        </UI.FieldLabelSubs2>
        <UI.FieldLabelSubs2 width='275px'>
          <label>{$t({ defaultMessage: 'Active Trial Assigned Licenses' })}</label>
          <label style={{ textAlign: 'right', fontWeight: '600' }}>
            {data.totalActiveTrialAssignedLicenseCount}</label>
        </UI.FieldLabelSubs2>
      </div>}
      <UI.FieldLabelSubs2 width='275px'>
        <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
        <label style={{ textAlign: 'right', fontWeight: '600' }}>
          {data.licensesUsed}</label>
      </UI.FieldLabelSubs2>
      <UI.FieldLabelSubs2 width='275px'>
        <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
        <label style={{ textAlign: 'right', fontWeight: '600' }}>
          {data.licenseGap >= 0
            ? <UI.LicenseAvailable>{data.licenseGap}</UI.LicenseAvailable>
            : <UI.LicenseGap>{data.licenseGap}</UI.LicenseGap>}</label>
      </UI.FieldLabelSubs2>
    </Card>
  </Col>
}

interface ComplianceProps {
  isMsp: boolean
}

export const LicenseCompliance = (props: ComplianceProps) => {
  const params = useParams()
  const { isMsp } = props

  const RecPayload = {
    filters: {
      licenseType: ['APSW'],
      complianceType: 'SELF'
    }
  }
  const MspPayload = {
    filters: {
      licenseType: ['APSW'],
      complianceType: 'MSP_SUMMARY'
    }
  }
  const queryData = useGetEntitlementsCompliancesQuery(
    { params, payload: isMsp ? MspPayload : RecPayload })

  const complianceData = queryData.data ?? fakeMspSummary
  const selfData = complianceData.compliances.APSW[0].self
  const summaryData = complianceData.compliances.APSW[0].mspEcSummary
  return <>
    {isMsp
      ? <UI.ComplianceContainer>
        <DeviceNetworkingCard
          title='Device Networking Subscriptions'
          subTitle='My Account License Expiration'
          data={selfData}
          isMsp={isMsp}
        />
        <DeviceNetworkingCard
          title='Device Networking Subscriptions'
          subTitle='MSP Customers License Expiration'
          isMsp={isMsp}
          data={summaryData} />
      </UI.ComplianceContainer>
      : <DeviceNetworkingCard
        title='Device Networking Subscriptions'
        subTitle='License Expiration'
        isMsp={false}
        data={summaryData}
      />
    }
  </>
}
