import React, { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Drawer }                     from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { useGetEntitlementsCompliancesQuery } from '@acx-ui/msp/services'
import { ComplianceData }                     from '@acx-ui/msp/utils'
import { TrialType }                          from '@acx-ui/rc/utils'
import { useParams }                          from '@acx-ui/react-router-dom'

import { emptyCompliance }      from './__tests__/fixtures'
import { ComplianceBanner }     from './ComplianceBanner'
import { DeviceNetworkingCard } from './DeviceNetworkingCard'
import LicenseCalculatorCard    from './LicenseCalculator'
import LicenseTimelineGraph     from './LicenseTimelineGraph'
import MspCustomersLicences     from './MspCustomersLicences'
import MspDeviceNetworkingCard  from './MspDeviceNetworkingCard'
import RecDeviceNetworkingCard  from './RecDeviceNetworkingCard'
import MSPSolutionTokenCard     from './SolutionToken/MspSolutionTokenCard'
import RecSolutionTokenCard     from './SolutionToken/RecSolutionTokenCard'
import SolutionTokenLicenses    from './SolutionToken/SolutionTokenLicenses'
import * as UI                  from './styledComponents'


interface ComplianceProps {
  isMsp: boolean
  isExtendedTrial?: boolean
}

export const LicenseCompliance = (props: ComplianceProps) => {
  const params = useParams()
  const { $t } = useIntl()
  const [selfData, setSelfData] = useState(emptyCompliance as ComplianceData)
  const [selfSolutionTokenData, setSelfSolutionTokenData] =
    useState(emptyCompliance as ComplianceData)
  const [ecSummaryData, setEcSummaryData] = useState(emptyCompliance as ComplianceData)
  const [ecSolutionTokenSummaryData, setEcSolutionTokenSummaryData] =
    useState(emptyCompliance as ComplianceData)
  const [openMspCustLicencesDrawer, setOpenMspCustLicencesDrawer] = useState(false)
  const [openLicenseTimelineDrawer, setOpenLicenseTimelineDrawer] = useState(false)
  const [openSolutionTokenLicensesDrawer, setOpenSolutionTokenLicensesDrawer] = useState(false)
  const { isMsp, isExtendedTrial } = props
  const showCompliancePhase2UI = useIsSplitOn(Features.ENTITLEMENT_LICENSE_COMPLIANCE_PHASE2_TOGGLE)
  const isComplianceNotesEnabled = useIsSplitOn(Features.ENTITLEMENT_COMPLIANCE_NOTES_TOGGLE)

  const RecPayload = {
    filters: {
      complianceType: 'SELF'
    }
  }
  const MspPayload = {
    filters: {
      complianceType: 'MSP_SUMMARY'
    }
  }
  const queryData = useGetEntitlementsCompliancesQuery(
    { params, payload: isMsp ? MspPayload : RecPayload })


  function openMspCustomersDrawer () {
    if(!openMspCustLicencesDrawer)
      setOpenMspCustLicencesDrawer(true)
  }

  function closeMspCustomersDrawer () {
    if(openMspCustLicencesDrawer)
      setOpenMspCustLicencesDrawer(false)
  }

  function openTimelineDrawer () {
    if(!openLicenseTimelineDrawer)
      setOpenLicenseTimelineDrawer(true)
  }

  function closeTimelineDrawer () {
    if(openLicenseTimelineDrawer)
      setOpenLicenseTimelineDrawer(false)
  }

  function opeSolutionTokenDrawer () {
    if(!openSolutionTokenLicensesDrawer)
      setOpenSolutionTokenLicensesDrawer(true)
  }

  function closeSolutionTokenDrawer () {
    if(openSolutionTokenLicensesDrawer)
      setOpenSolutionTokenLicensesDrawer(false)
  }

  useEffect(() => {
    if (queryData?.data?.compliances) {
      const retData = queryData.data.compliances.filter(comp => comp.licenseType === 'APSW')
      if (retData.length > 0) {
        setSelfData(retData[0].self ?? emptyCompliance as ComplianceData)
        if (isMsp && retData[0].mspEcSummary)
          setEcSummaryData(retData[0].mspEcSummary)
      }

      const solutionTokenData =
        queryData.data.compliances.filter(comp => comp.licenseType === 'SLTN_TOKEN')
      if (solutionTokenData.length > 0) {
        setSelfSolutionTokenData(solutionTokenData[0].self ?? emptyCompliance as ComplianceData)
        if (isMsp && solutionTokenData[0].mspEcSummary)
          setEcSolutionTokenSummaryData(solutionTokenData[0].mspEcSummary)
      }
    }
  }, [queryData?.data])

  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

  return <>
    {isComplianceNotesEnabled && <ComplianceBanner />}
    {isMsp
      ? <UI.ComplianceContainer>
        { !solutionTokenFFToggled ? <>
          <DeviceNetworkingCard
            title={$t({ defaultMessage: 'Device Networking Subscriptions' })}
            subTitle={$t({ defaultMessage: 'My Account License Expiration' })}
            data={selfData}
            isMsp={true}
            trialType={TrialType.TRIAL}
          />
          <DeviceNetworkingCard
            title={$t({ defaultMessage: 'Device Networking Subscriptions' })}
            subTitle={$t({ defaultMessage: 'MSP Customers License Expiration' })}
            isMsp={false}
            data={ecSummaryData}
            trialType={isExtendedTrial ? TrialType.EXTENDED_TRIAL : undefined}
            footerContent={showCompliancePhase2UI ? <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'end'
            }}>
              <Button
                size='small'
                type={'link'}
                onClick={openMspCustomersDrawer}>
                {$t({ defaultMessage: 'View Details' })}
              </Button>
            </div> : <></>}
          /></>
          : <><MspDeviceNetworkingCard
            title={$t({ defaultMessage: 'Device Networking Licenses' })}
            selfData={selfData}
            mspData={ecSummaryData}
            isExtendedTrial={isExtendedTrial}
            footerContent={showCompliancePhase2UI ? <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'end'
            }}>
              <Button
                size='small'
                type={'link'}
                onClick={openMspCustomersDrawer}>
                {$t({ defaultMessage: 'View Details' })}
              </Button>
            </div> : <></>}
          />
          <MSPSolutionTokenCard
            title={$t({ defaultMessage: 'Solution Token Licenses' })}
            selfData={selfSolutionTokenData}
            mspData={ecSolutionTokenSummaryData}
            isExtendedTrial={isExtendedTrial}
            footerContent={
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'end'
              }}>
                <Button
                  size='small'
                  type={'link'}
                  onClick={opeSolutionTokenDrawer}>
                  {$t({ defaultMessage: 'View Details' })}
                </Button>
              </div>} />
          </>
        }
        {
          showCompliancePhase2UI && openMspCustLicencesDrawer && <Drawer
            title={<>{solutionTokenFFToggled
              ? $t({ defaultMessage: 'Device Networking Licenses' })
              : $t({ defaultMessage: 'Device Networking Subscriptions' })}
            {ecSummaryData.licenseGap >= 0 ? <UI.GreenTickIcon /> : <UI.RedTickIcon />}</>}
            visible={openMspCustLicencesDrawer}
            onClose={closeMspCustomersDrawer}
            destroyOnClose={true}
            width={1080}
          >
            <MspCustomersLicences />
          </Drawer>
        }
        { showCompliancePhase2UI && <LicenseCalculatorCard
          title={solutionTokenFFToggled ?
            $t({ defaultMessage: 'License Distance Calculator' })
            : $t({ defaultMessage: 'Device Networking Subscriptions' })}
          subTitle={
            !solutionTokenFFToggled
              ? $t({ defaultMessage: 'License Distance Calculator' })
              : undefined}
          footerContent={<div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'end',
            borderTop: '1px solid #02a7f0',
            paddingTop: '8px'
          }}>
            <span>{$t({ defaultMessage: 'To view currently available licenses timeline, ' })}</span>
            <Button
              size='small'
              type={'link'}
              onClick={openTimelineDrawer}>
              {$t({ defaultMessage: 'Click Here' })}
            </Button>
          </div>}
        /> }
        {
          openLicenseTimelineDrawer && <Drawer
            title={<>{$t({ defaultMessage: 'Device Networking Paid Licenses' })}</>}
            visible={openLicenseTimelineDrawer}
            onClose={closeTimelineDrawer}
            footer={<Button
              size='middle'
              style={{
                width: '80px'
              }}
              type={'default'}
              onClick={closeTimelineDrawer}>
              {$t({ defaultMessage: 'Close' })}
            </Button>}
            destroyOnClose={true}
            width={1080}
          >
            <LicenseTimelineGraph />
          </Drawer>
        }
        {
          solutionTokenFFToggled && openSolutionTokenLicensesDrawer && <Drawer
            title={<>{$t({ defaultMessage: 'Solution Token Licenses' })}
              {ecSummaryData.licenseGap >= 0 ? <UI.GreenTickIcon /> : <UI.RedTickIcon />}</>}
            visible={openSolutionTokenLicensesDrawer}
            onClose={closeSolutionTokenDrawer}
            destroyOnClose={true}
            width={1080}
          >
            <SolutionTokenLicenses />
          </Drawer>
        }
      </UI.ComplianceContainer>
      : solutionTokenFFToggled
        ? <UI.ComplianceContainer><RecDeviceNetworkingCard
          title={$t({ defaultMessage: 'Device Networking Licenses' })}
          data={selfData}
          trialType={TrialType.TRIAL}
        />
        <RecSolutionTokenCard
          title={$t({ defaultMessage: 'Solution Token Licenses' })}
          data={selfSolutionTokenData}
          trialType={TrialType.TRIAL}
        /></UI.ComplianceContainer>
        : <DeviceNetworkingCard
          title={$t({ defaultMessage: 'Device Networking Subscriptions' })}
          subTitle={$t({ defaultMessage: 'License Expiration' })}
          isMsp={false}
          data={selfData}
          trialType={TrialType.TRIAL}
        />}
  </>
}
