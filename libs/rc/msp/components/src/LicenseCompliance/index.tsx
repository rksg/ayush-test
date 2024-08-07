import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Card }           from '@acx-ui/components'
import { ComplianceData } from '@acx-ui/msp/utils'

import { fakeMspSummary } from './__tests__/fixtures'
import * as UI            from './styledComponents'

// interface ShowMoreFirmwaresLinkProps {
//     shownMoreFirmwaresInBanner: boolean
//     setShownMoreFirmwaresInBanner: (shown: boolean) => void
// }

// function ShowMoreNotesLink (props: ShowMoreFirmwaresLinkProps) {
//   const { $t } = useIntl()
//   const { shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner } = props

//   return <span
//     style={{
//       cursor: 'pointer',
//       color: 'var(--acx-accents-blue-50)',
//       fontSize: cssNumber('--acx-body-4-font-size')
//     }}
//     onClick={() => setShownMoreFirmwaresInBanner(!shownMoreFirmwaresInBanner)}
//   >
//     {shownMoreFirmwaresInBanner
//       ? $t({ defaultMessage: 'Show less' })
//       : $t({ defaultMessage: 'Show more' })
//     }
//   </span>
// }

const ComplianceBanner = () => {
  const { $t } = useIntl()
  // const [ shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner ] = useState(false)

  return (
    <UI.BannerVersion>
      <Row justify='space-between' gutter={[16, 16]}>
        <Col style={{ width: '100%' }}>
          <UI.LatestVersion>
            {$t({ defaultMessage: 'Attention Notes' })}
          </UI.LatestVersion>
          <div>{$t({ defaultMessage: `- On January 1, 2025 RUCKUS One will 
            stop adding 5% courtesy licenses to the MSP subscriptions.` })}</div>
          <div>{$t({ defaultMessage: `- On March 1, 2025 RUCKUS One will start enforcing 
            subscription expiration policy, which may have an impact on your network operation.` })}
          </div>
        </Col>
      </Row>
    </UI.BannerVersion>
  )
}

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
      <UI.FieldLabelSubs width='275px' style={{ marginTop: '15px' }}>
        <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.totalActivePaidLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'Active Trial Licenses' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.totalActiveTrialLicenseCount}</label>
      </UI.FieldLabelSubs>
      {isMsp && <div>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Active Paid Assigned Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {data.totalActivePaidAssignedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Active Trial Assigned Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {data.totalActiveTrialAssignedLicenseCount}</label>
        </UI.FieldLabelSubs>
      </div>}
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.licensesUsed}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'>
        <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
        <label style={{ textAlign: 'center' }}>
          {data.licenseGap >= 0
            ? <UI.LicenseAvailable>{data.licenseGap}</UI.LicenseAvailable>
            : <UI.LicenseGap>{data.licenseGap}</UI.LicenseGap>}</label>
      </UI.FieldLabelSubs>
    </Card>
  </Col>
}

interface ComplianceProps {
  isMsp: boolean
}

export const LicenseCompliance = (props: ComplianceProps) => {
  const { isMsp } = props

  const complianceData = fakeMspSummary
  const selfData = complianceData.compliances.APSW[0].self
  const summaryData = complianceData.compliances.APSW[0].mspEcSummary
  return <>
    <ComplianceBanner />
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
