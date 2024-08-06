import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

// import { cssNumber } from '@acx-ui/components'

import { Card } from '@acx-ui/components'
// import { ComplianceData } from '@acx-ui/msp/utils'

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

const DeviceNetworking = () => {
  const { $t } = useIntl()
  const complianceData = fakeMspSummary
  const selfData = complianceData.compliances.APSW[0].self
  const summaryData = complianceData.compliances.APSW[0].mspEcSummary
  return <>
    <Col style={{ width: '425px', paddingLeft: 0, marginTop: '15px' }}>
      <Card
        title={$t({ defaultMessage: 'Device Networking Subscriptions' })}
        subTitle={$t({ defaultMessage: 'My Account License Expiration' })}
      >
        <UI.FieldLabelSubs width='275px' style={{ fontWeight: '600' }}>
          <label>{$t({ defaultMessage: 'Devices' })}</label>
          <label style={{ textAlign: 'center' }}>
            {$t({ defaultMessage: 'Configured' })}</label>
          <label style={{ textAlign: 'center' }}>
            {$t({ defaultMessage: 'Licenses Used' })}</label>
        </UI.FieldLabelSubs>

        <UI.FieldLabelSubs width='275px' style={{ marginTop: '10px' }}>
          <label>{$t({ defaultMessage: 'Access Points' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.WIFI.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.WIFI.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Switches' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.SWITCH.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.SWITCH.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'SmartEdge vAppliances' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.VIRTUAL_EDGE.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.VIRTUAL_EDGE.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'SmartEdge HW Appliances' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.EDGE.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.deviceCompliances.EDGE.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'RWGs' })}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'SmartZones' })}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px' style={{ marginTop: '15px' }}>
          <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.totalActivePaidLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Active Trial Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.totalActiveTrialLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Active Paid Assigned Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.totalActivePaidAssignedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Active Trial Assigned Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.totalActiveTrialAssignedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.licensesUsed}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
          <label style={{ textAlign: 'center' }}>
            {selfData.licenseGap >= 0
              ? <UI.LicenseAvailable>{selfData.licenseGap}</UI.LicenseAvailable>
              : <UI.LicenseGap>{selfData.licenseGap}</UI.LicenseGap>}</label>
        </UI.FieldLabelSubs>
      </Card>
    </Col>

    <Col style={{ width: '425px', paddingLeft: 0, marginTop: '15px' }}>
      <Card
        title={$t({ defaultMessage: 'Device Networking Subscriptions' })}
        subTitle={$t({ defaultMessage: 'MSP Customers License Expiration' })}
      >
        <UI.FieldLabelSubs width='275px' style={{ fontWeight: '600' }}>
          <label>{$t({ defaultMessage: 'Devices' })}</label>
          <label style={{ textAlign: 'center' }}>
            {$t({ defaultMessage: 'Configured' })}</label>
          <label style={{ textAlign: 'center' }}>
            {$t({ defaultMessage: 'Licenses Used' })}</label>
        </UI.FieldLabelSubs>

        <UI.FieldLabelSubs width='275px' style={{ marginTop: '10px' }}>
          <label>{$t({ defaultMessage: 'Access Points' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.WIFI.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.WIFI.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Switches' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.SWITCH.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.SWITCH.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'SmartEdge vAppliances' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.VIRTUAL_EDGE.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.VIRTUAL_EDGE.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'SmartEdge HW Appliances' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.EDGE.installedDeviceCount}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.deviceCompliances.EDGE.usedLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'RWGs' })}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'SmartZones' })}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
          <label style={{ textAlign: 'center' }}>{'--'}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px' style={{ marginTop: '15px' }}>
          <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.totalActivePaidLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Active Trial Licenses' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.totalActiveTrialLicenseCount}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.licensesUsed}</label>
        </UI.FieldLabelSubs>
        <UI.FieldLabelSubs width='275px'>
          <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
          <label style={{ textAlign: 'center' }}>
            {summaryData.licenseGap >= 0
              ? <UI.LicenseAvailable>{summaryData.licenseGap}</UI.LicenseAvailable>
              : <UI.LicenseGap>{summaryData.licenseGap}</UI.LicenseGap>}</label>
        </UI.FieldLabelSubs>
      </Card>
    </Col>
  </>
}

// const DeviceNetworkingCard = (title: string, subTitle: string, data: ComplianceData) => {
//   const { $t } = useIntl()
//   return <Col style={{ width: '425px', paddingLeft: 0, marginTop: '15px' }}>
//     <Card
//       title={$t({ defaultMessage: '{title}' }, { title })}
//       subTitle={$t({ defaultMessage: '{subTitle}' }, { subTitle })}
//     >
//       <UI.FieldLabelSubs width='275px' style={{ fontWeight: '600' }}>
//         <label>{$t({ defaultMessage: 'Devices' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {$t({ defaultMessage: 'Configured' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {$t({ defaultMessage: 'Licenses Used' })}</label>
//       </UI.FieldLabelSubs>

//       <UI.FieldLabelSubs width='275px' style={{ marginTop: '10px' }}>
//         <label>{$t({ defaultMessage: 'Access Points' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.WIFI.installedDeviceCount}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.WIFI.usedLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'Switches' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.SWITCH.installedDeviceCount}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.SWITCH.usedLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'SmartEdge vAppliances' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.VIRTUAL_EDGE.installedDeviceCount}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.VIRTUAL_EDGE.usedLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'SmartEdge HW Appliances' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.EDGE.installedDeviceCount}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.deviceCompliances.EDGE.usedLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'RWGs' })}</label>
//         <label style={{ textAlign: 'center' }}>{'--'}</label>
//         <label style={{ textAlign: 'center' }}>{'--'}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'SmartZones' })}</label>
//         <label style={{ textAlign: 'center' }}>{'--'}</label>
//         <label style={{ textAlign: 'center' }}>{'--'}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px' style={{ marginTop: '15px' }}>
//         <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.totalActivePaidLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'Active Trial Licenses' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.totalActiveTrialLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'Active Paid Assigned Licenses' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.totalActivePaidAssignedLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'Active Trial Assigned Licenses' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.totalActiveTrialAssignedLicenseCount}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.licensesUsed}</label>
//       </UI.FieldLabelSubs>
//       <UI.FieldLabelSubs width='275px'>
//         <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
//         <label style={{ textAlign: 'center' }}>
//           {data.licenseGap >= 0
//             ? <UI.LicenseAvailable>{data.licenseGap}</UI.LicenseAvailable>
//             : <UI.LicenseGap>{data.licenseGap}</UI.LicenseGap>}</label>
//       </UI.FieldLabelSubs>
//     </Card>
//   </Col>
// }

export const LicenseCompliance = () => {
  return <>
    <ComplianceBanner />
    <DeviceNetworking />
  </>
}
