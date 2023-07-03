import { useState, useEffect, useContext } from 'react'

import _                    from 'lodash'
import { useIntl }          from 'react-intl'
import { FormattedMessage } from 'react-intl'

import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }        from '@acx-ui/formatter'
import { useGetMspEntitlementBannersQuery } from '@acx-ui/msp/services'
import { useEntitlementBannersQuery }       from '@acx-ui/rc/services'
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
      .filter(item => item.deviceType !== 'ANALYTICS')
      .forEach(item => {
        expireList.push(
          {
            deviceCount: item!.deviceCount,
            effectDate: item!.effectDate,
            effectDays: item!.effectDays,
            deviceType: item!.deviceType,
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

  const [expireList, setExpireList] = useState<ExpireInfo[]>([])

  const params = useParams()

  const { data: bannerData } = useEntitlementBannersQuery({ params }, { skip: isMSPUser })
  const { data: mspBannerData } = useGetMspEntitlementBannersQuery({ params }, { skip: !isMSPUser })

  useEffect(() => {
    if(bannerData || mspBannerData){
      const list = getExpireInfo(isMSPUser ? (mspBannerData||[]) : bannerData||[])
      setExpireList(list)
    }

  },[bannerData, isMSPUser, mspBannerData])

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
        <UI.SubTips expired={isExpired}>
          <FormattedMessage {...descTips}
            values={{
              b: chunks => chunks,
              a: (chunks) =>
                <UI.ActiveBtn onClick={()=>{setLicenseExpanded(false)}}
                  $expired={isExpired}
                  to='administration/subscriptions'>
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
            <UI.LayoutIcon children={<UI.WarnIcon isCritical={isCritical}/>} />
          </UI.LicenseIconWrapper>
          <UI.TipsWrapper>
            <UI.MainTips>
              {$t({ defaultMessage: 'Subscriptions require your attention' })}
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
          return <UI.LicenseGrid expired={isExpired} isWhiteBorder={isWhiteBorder}>
            { getCardItem(expireInfo) }
          </UI.LicenseGrid>
        })}
      </UI.LicenseContainer>
    </div>
  }

  const licenseRender = ()=>{
    if(expireList && expireList.length===1 && width>MAX_VIEWPORT_CHANGE){
      const expireInfo = _.first(expireList)

      const isExpired = expireInfo && getIsExpired(expireInfo)
      return <UI.LicenseContainerSingle expired={isExpired}>
        { getCardItem(expireInfo!) }
      </UI.LicenseContainerSingle>
    }
    return multipleRender()
  }

  return <UI.LicenseWrapper>
    {!_.isEmpty(expireList) && isFFEnabled && licenseRender()}
  </UI.LicenseWrapper>
}
