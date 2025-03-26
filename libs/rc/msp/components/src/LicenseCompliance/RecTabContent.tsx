
import { useIntl } from 'react-intl'

import { ComplianceData, DeviceComplianceType } from '@acx-ui/msp/utils'
import { TrialType }                            from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface RecTabContentProps {
    data: ComplianceData,
    trialType?: string,
    summaryTabSelected: boolean,
    myAccountTabSelected: boolean
 }

export default function RecTabContent (props: RecTabContentProps) {
  const { $t } = useIntl()
  const { data, trialType, summaryTabSelected,
    myAccountTabSelected } = props

  const { totalActivePaidLicenseCount, nextTotalPaidExpiringLicenseCount, nextPaidExpirationDate,
    licensesUsed,
    licenseGap, totalActiveTrialLicenseCount, nextTotalTrialExpiringLicenseCount,
    nextTrialExpirationDate
  } = data

  const wifiData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.WIFI)
  const switchData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.SWITCH)
  const virtualEdgeData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.VIRTUAL_EDGE)
  const rwgData = data.deviceCompliances.find(item =>
    item.deviceType === DeviceComplianceType.RWG)
  return <>
    { myAccountTabSelected && <>
      <UI.FieldLabelSubs width='275px'
        style={{ fontWeight: '600',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--acx-accents-blue-55)' }}>
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
        <label>{$t({ defaultMessage: 'Edge vAppliances' })}</label>
        <label>{virtualEdgeData?.installedDeviceCount}</label>
        <label>{virtualEdgeData?.usedLicenseCount}</label>
      </UI.FieldLabelSubs>
      <UI.FieldLabelSubs width='275px'
        style={{ paddingBottom: '15px' }}>
        <label>{$t({ defaultMessage: 'RWGs' })}</label>
        <label>{rwgData?.installedDeviceCount}</label>
        <label>{rwgData?.usedLicenseCount}</label>
      </UI.FieldLabelSubs>

    </>}
    { summaryTabSelected &&
      <>
        <UI.FieldLabelSubs2 width='275px' style={{ marginTop: '15px' }}>
          <label>{$t({ defaultMessage: 'Active Paid Licenses' })}</label>
          <label>{totalActivePaidLicenseCount}</label>
          {totalActivePaidLicenseCount > 0 &&
              <label style={{ textAlign: 'left',
                marginLeft: '10px',
                color: 'var(--acx-accents-orange-50)' }}>
                {$t({ defaultMessage: '({count} expire on {date})' }, {
                  count: nextTotalPaidExpiringLicenseCount,
                  date: nextPaidExpirationDate
                })}</label>}
        </UI.FieldLabelSubs2>
        {trialType && <UI.FieldLabelSubs2 width='275px'>
          <label>{trialType === TrialType.EXTENDED_TRIAL
            ? $t({ defaultMessage: 'Active Extended Trial Licenses' })
            : $t({ defaultMessage: 'Active Trial Licenses' })}</label>
          <label>{totalActiveTrialLicenseCount}</label>
          { totalActiveTrialLicenseCount > 0 &&
              <label style={{ textAlign: 'left',
                marginLeft: '10px',
                color: 'var(--acx-accents-orange-50)' }}>
                {$t({ defaultMessage: '({count} expire on {date})' }, {
                  count: nextTotalTrialExpiringLicenseCount,
                  date: nextTrialExpirationDate
                })}</label>}
        </UI.FieldLabelSubs2>}

        <UI.FieldLabelSubs2 style={{ marginTop: '10px' }} width='275px'>
          <label>{$t({ defaultMessage: 'Licenses Used' })}</label>
          <label>{licensesUsed}</label>
        </UI.FieldLabelSubs2>
        <UI.FieldLabelSubs2 width='275px'>
          <label>{$t({ defaultMessage: 'Licenses Available / Gap' })}</label>
          <label>
            {licenseGap && licenseGap >= 0
              ? <UI.LicenseAvailable>{licenseGap}</UI.LicenseAvailable>
              : <UI.LicenseGap>{licenseGap}</UI.LicenseGap>}</label>
        </UI.FieldLabelSubs2>
      </>
    }
  </>
}