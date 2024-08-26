import { useEffect, useState } from 'react'

import { Col }     from 'antd'
import { useIntl } from 'react-intl'

import { Card }                                 from '@acx-ui/components'
import { useGetEntitlementsCompliancesQuery }   from '@acx-ui/msp/services'
import { ComplianceData, DeviceComplianceType } from '@acx-ui/msp/utils'
import { useParams }                            from '@acx-ui/react-router-dom'

import { emptyCompliance } from './__tests__/fixtures'
import * as UI             from './styledComponents'

interface LicenseCardProps {
  title: string
  subTitle: string
  data: ComplianceData
  isMsp: boolean
  trialType?: string
}

interface ComplianceProps {
  isMsp: boolean
  isExtendedTrial?: boolean
}

enum TrialType {
  TRIAL = 'TRIAL',
  EXTENDED_TRIAL = 'EXTENDED_TRIAL'
}

const DeviceNetworkingCard = (props: LicenseCardProps) => {
  const { $t } = useIntl()
  const { title, subTitle, data, isMsp, trialType } = props

  const wifiData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.WIFI)
  const switchData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.SWITCH)
  const virtualEdgeData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.VIRTUAL_EDGE)
  const rwgData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.RWG)

  return <Col style={{ width: '435px', paddingLeft: 0, marginTop: '15px' }}>
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
        <label>{$t({ defaultMessage: 'SmartEdge vAppliances' })}</label>
        <label>{virtualEdgeData?.installedDeviceCount}</label>
        <label>{virtualEdgeData?.usedLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'
        style={{ paddingBottom: '15px', borderBottom: '1px solid #02a7f0' }}>
        <label>{$t({ defaultMessage: 'RWGs' })}</label>
        <label>{rwgData?.installedDeviceCount}</label>
        <label>{rwgData?.usedLicenseCount}</label>
      </UI.FieldLabelSubs>

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
            {`(${data.nextTotalTrialExpiringLicenseCount} ${$t({ defaultMessage: 'expire on' })} 
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
      <UI.FieldLabelSubs2 width='275px'>
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
    </Card>
  </Col>
}

export const LicenseCompliance = (props: ComplianceProps) => {
  const params = useParams()
  const [selfData, setSelfData] = useState(emptyCompliance as ComplianceData)
  const [ecSummaryData, setEcSummaryData] = useState(emptyCompliance as ComplianceData)
  const { isMsp, isExtendedTrial } = props

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

  useEffect(() => {
    if (queryData?.data?.compliances) {
      const retData = queryData.data.compliances.filter(comp => comp.licenseType === 'APSW')
      if (retData.length > 0) {
        setSelfData(retData[0].self ?? emptyCompliance as ComplianceData)
        if (isMsp && retData[0].mspEcSummary)
          setEcSummaryData(retData[0].mspEcSummary)
      }
    }
  }, [queryData?.data])

  return isMsp
    ? <UI.ComplianceContainer>
      <DeviceNetworkingCard
        title='Device Networking Subscriptions'
        subTitle='My Account License Expiration'
        data={selfData}
        isMsp={true}
        trialType={TrialType.TRIAL}
      />
      <DeviceNetworkingCard
        title='Device Networking Subscriptions'
        subTitle='MSP Customers License Expiration'
        isMsp={false}
        data={ecSummaryData}
        trialType={isExtendedTrial ? TrialType.EXTENDED_TRIAL : undefined}
      />
    </UI.ComplianceContainer>
    : <DeviceNetworkingCard
      title='Device Networking Subscriptions'
      subTitle='License Expiration'
      isMsp={false}
      data={selfData}
      trialType={TrialType.TRIAL}
    />

}
