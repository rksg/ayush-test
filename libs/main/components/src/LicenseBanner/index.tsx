import { useState, useEffect, useContext } from 'react'

import _                    from 'lodash'
import { useIntl }          from 'react-intl'
import { FormattedMessage } from 'react-intl'

import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                               from '@acx-ui/formatter'
import { useGetEntitlementsAttentionNotesQuery, useGetMspEntitlementBannersQuery } from '@acx-ui/msp/services'
import { GeneralAttentionNotesPayload, MspAttentionNotesPayload }                  from '@acx-ui/msp/utils'
import { useEntitlementBannersQuery, useGetBannersQuery }                          from '@acx-ui/rc/services'
import {
  LicenseBannerTypeEnum,
  EntitlementBanner,
  EntitlementDeviceType,
  EntitlementUtil
}                                    from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { HeaderContext } from '../HeaderContext'

import {
  LicenseBannerRemindMapping,
  LicenseBannerDescMapping,
  MSPLicenseBannerRemindMapping,
  MSPLicenseBannerDescMapping } from './contentsMap'
import useViewport from './hooks/useViewport'
import * as UI     from './styledComponents'

const MAX_VIEWPORT_CHANGE = 1510
const getBulbIcon = (expireType:LicenseBannerTypeEnum | undefined) => {
  if(expireType === LicenseBannerTypeEnum.initial){
    return <UI.BulbLesserInitial/>
  }
  else if(expireType === LicenseBannerTypeEnum.closeToExpiration){
    return <UI.BulbLesser7/>
  }
  else if(expireType === LicenseBannerTypeEnum.gracePeriod){
    return <UI.BulbGrace/>
  }
  else if(expireType === LicenseBannerTypeEnum.expired ||
    expireType === LicenseBannerTypeEnum.msp_expired
  ){
    return <UI.Expired/>
  }
  return
}

export interface ExpireInfo {
  deviceCount: number
  effectDate: string
  effectDays: number
  deviceType: EntitlementDeviceType
  isMultipleLicense: boolean
  expireType: LicenseBannerTypeEnum
}

const getExpireInfo = (bannerList:EntitlementBanner[])=>{
  const expireList:ExpireInfo[] = []
  if(!_.isEmpty(bannerList)){
    bannerList
      .filter(item => item.licenseType !== 'ANALYTICS')
      .forEach(item => {
        expireList.push(
          {
            deviceCount: item!.licenseCount,
            effectDate: item!.effectDate,
            effectDays: item!.effectiveDays,
            deviceType: item!.licenseType,
            isMultipleLicense: item!.multipleLicense,
            expireType: item!.type
          }
        )
      })
  }
  return expireList
}
interface BannerProps {
  isMSPUser?: boolean
}
export function LicenseBanner (props: BannerProps) {
  const { searchExpanded, licenseExpanded,
    setSearchExpanded, setLicenseExpanded } = useContext(HeaderContext)
  const { $t } = useIntl()

  const { width } = useViewport()

  const { isMSPUser } = props

  const isFFEnabled = useIsSplitOn(Features.LICENSE_BANNER)
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isComplianceNotesEnabled = useIsSplitOn(Features.ENTITLEMENT_COMPLIANCE_NOTES_TOGGLE)
  const isAttentionNotesToggleEnabled = useIsSplitOn(Features.ENTITLEMENT_ATTENTION_NOTES_TOGGLE)
  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

  const [expireList, setExpireList] = useState<ExpireInfo[]>([])

  const params = useParams()

  const { data: bannerData } = useEntitlementBannersQuery({ params },
    { skip: isMSPUser || isEntitlementRbacApiEnabled })
  const { data: mspBannerData } = useGetMspEntitlementBannersQuery({ params },
    { skip: !isMSPUser || isEntitlementRbacApiEnabled })
  const { data: queryData } = useGetEntitlementsAttentionNotesQuery(
    { params, payload: isAttentionNotesToggleEnabled ? GeneralAttentionNotesPayload
      : MspAttentionNotesPayload }, { skip: !isComplianceNotesEnabled })

  const recPayload = {
    filters: {
      usageType: 'SELF'
    }
  }
  const mspPayload = {
    filters: {
      licenseType: solutionTokenFFToggled ? ['APSW', 'SLTN_TOKEN'] : ['APSW'],
      usageType: 'ASSIGNED'
    }
  }

  const { data: bannersSelf } = useGetBannersQuery({ params, payload: recPayload },
    { skip: isMSPUser || !isEntitlementRbacApiEnabled })
  const { data: bannersMsp } = useGetBannersQuery({ params, payload: mspPayload },
    { skip: !isMSPUser || !isEntitlementRbacApiEnabled })

  useEffect(() => {
    if(!isEntitlementRbacApiEnabled && (bannerData || mspBannerData)){
      const list = getExpireInfo(isMSPUser ? (mspBannerData||[]) : bannerData||[])
      setExpireList(list)
    }
    if(isEntitlementRbacApiEnabled && (bannersSelf || bannersMsp)) {
      const list = getExpireInfo(isMSPUser ? (bannersMsp?.data||[]) : bannersSelf?.data || [])
      setExpireList(list)
    }

  },[bannerData, isMSPUser, mspBannerData, bannersSelf, bannersMsp])

  const getMainTipsContent = (expireInfo:ExpireInfo)=>{
    return isMSPUser ?
      MSPLicenseBannerRemindMapping(expireInfo, $t)[expireInfo.expireType]
      :
      LicenseBannerRemindMapping(expireInfo, $t)[expireInfo.expireType]
  }

  const getIsExpired = (expireInfo:ExpireInfo)=>
    expireInfo.expireType===LicenseBannerTypeEnum.expired ||
    expireInfo!.expireType===LicenseBannerTypeEnum.gracePeriod ||
    expireInfo.expireType===LicenseBannerTypeEnum.msp_expired

  const getCardItem = (expireInfo:ExpireInfo) => {
    const isExpired = getIsExpired(expireInfo)
    const descTips = isMSPUser ?
      MSPLicenseBannerDescMapping()[expireInfo.expireType]
      :
      LicenseBannerDescMapping()[expireInfo.expireType]
    return <>
      <UI.LicenseIconWrapper>
        <UI.LayoutIcon children={getBulbIcon(expireInfo.expireType)} />
      </UI.LicenseIconWrapper>
      <UI.TipsWrapper>
        <UI.MainTips expired={isExpired} children={getMainTipsContent(expireInfo)}/>
        <UI.SubTips expired={isExpired} style={{ whiteSpace: 'pre' }}>
          <FormattedMessage {...descTips}
            values={{
              b: chunks => chunks,
              a: (chunks) =>
                <UI.ActiveBtn onClick={()=>{setLicenseExpanded(false)}}
                  $expired={isExpired}
                  tenantType={isMSPUser ? 'v' : 't'}
                  to={isMSPUser ? 'mspLicenses' : 'administration/subscriptions'}>
                  {chunks}
                </UI.ActiveBtn>,
              expireDeviceType: EntitlementUtil.getDeviceTypeText($t, expireInfo.deviceType),
              graceDate: formatter(DateFormatEnum.DateFormat)(expireInfo.effectDate)
            }}
          />
        </UI.SubTips>
      </UI.TipsWrapper>
    </>
  }
  const multipleRender = () => {
    const isCritical = _.some(expireList, (expireInfo)=>{
      return getIsExpired(expireInfo)
    })
    const attentionNotes = !_.isEmpty(queryData?.data)
    const expandBtn = <UI.LicenseWarningBtn
      data-testid='arrowBtn'
      isCritical={isCritical}
      isExpanded={licenseExpanded}
      onClick={()=>{
        if(searchExpanded){
          setSearchExpanded && setSearchExpanded(false)
        }
        setLicenseExpanded(!licenseExpanded)
      }}>
      <UI.WarningBtnContainer>
        <UI.ContentWrapper>
          <UI.LicenseIconWrapper>
            <UI.LayoutIcon children={<UI.WarnIcon $isCritical={isCritical}/>} />
          </UI.LicenseIconWrapper>
          <UI.TipsWrapper>
            <UI.MainTips>
              {attentionNotes
                ? $t({ defaultMessage: 'Subscriptions and licensing notes require your attention' })
                : $t({ defaultMessage: 'Subscriptions require your attention' })}
            </UI.MainTips>
          </UI.TipsWrapper>
        </UI.ContentWrapper>
        {licenseExpanded ? <UI.CaretDown/> : <UI.CaretLeft/>}
      </UI.WarningBtnContainer>
    </UI.LicenseWarningBtn>

    if(!licenseExpanded){
      return expandBtn
    }

    return <div>
      <UI.LicenseContainer>
        {expandBtn}
        {expireList.map((expireInfo, index) => {
          let isWhiteBorder = false
          if(index>0){
            let previous = expireList[index-1]
            const prevIsExpired = getIsExpired(previous)
            const curIsExpired = getIsExpired(expireInfo)
            if(!prevIsExpired && !curIsExpired) {
              isWhiteBorder = true
            }
          }
          const isExpired = getIsExpired(expireInfo)
          return <UI.LicenseGrid expired={isExpired} key={index} isWhiteBorder={isWhiteBorder}>
            { getCardItem(expireInfo) }
          </UI.LicenseGrid>
        })}
        {attentionNotes &&
        <UI.LicenseGrid expired={false} isWhiteBorder={false}>
          { notesRender() }
        </UI.LicenseGrid>
        }
      </UI.LicenseContainer>
    </div>
  }

  const licenseRender = ()=>{
    if(expireList && expireList.length===1 && width>MAX_VIEWPORT_CHANGE
      && _.isEmpty(queryData?.data)){
      const expireInfo = _.first(expireList)

      const isExpired = expireInfo && getIsExpired(expireInfo)
      return <UI.LicenseContainerSingle expired={isExpired}>
        { getCardItem(expireInfo!) }
      </UI.LicenseContainerSingle>
    }
    return multipleRender()
  }

  const notesRender = ()=>{
    return <UI.LicenseContainerSingle expired={false}>
      <UI.LicenseIconWrapper>
        <UI.LayoutIcon children={<UI.BulbLesserInitial/>} />
      </UI.LicenseIconWrapper>
      <UI.TipsWrapper>
        <UI.MainTips expired={false}
          children={'RUCKUS One subscription note is available on the Compliance page'}/>
        <UI.SubTips expired={false} style={{ whiteSpace: 'pre' }}>
          <FormattedMessage
            defaultMessage={'<a>See licensing attention note</a>'}
            values={{
              b: chunks => chunks,
              a: (chunks) =>
                <UI.ActiveBtn onClick={()=>{setLicenseExpanded(false)}}
                  tenantType={isMSPUser ? 'v' : 't'}
                  to={isMSPUser ? 'mspLicenses/compliance'
                    : 'administration/subscriptions/compliance'}>
                  {chunks}
                </UI.ActiveBtn>
            }}
          />
        </UI.SubTips>
      </UI.TipsWrapper>
    </UI.LicenseContainerSingle>
  }

  return !_.isEmpty(expireList) && isFFEnabled
    ? <UI.LicenseWrapper>
      {licenseRender()}
    </UI.LicenseWrapper>
    : !_.isEmpty(queryData?.data)
      ? <UI.LicenseWrapper>
        {notesRender()}
      </UI.LicenseWrapper>
      : <UI.ContentWrapper />
}
