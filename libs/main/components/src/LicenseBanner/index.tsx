import { useState, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  useEntitlementBannersQuery,
  useGetMspEntitlementBannersQuery
} from '@acx-ui/rc/services'
import {
  LicenseBannerTypeEnum,
  EntitlementBanner,
  EntitlementDeviceType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { LicenseBannerRemindMapping, LicenseBannerDescMapping } from './contentsMap'
import * as UI                                                  from './styledComponents'


const getBulbIcon = (expireType:LicenseBannerTypeEnum | undefined) => {
  if(expireType === LicenseBannerTypeEnum.initial ||
     expireType === LicenseBannerTypeEnum.ra_50_to_90_percent ||
     expireType === LicenseBannerTypeEnum.ra_onboard_only){
    return <UI.BulbLesserInitial/>
  }
  else if(expireType === LicenseBannerTypeEnum.closeToExpiration){
    return <UI.BulbLesser7/>
  }
  else if(expireType === LicenseBannerTypeEnum.gracePeriod){
    return <UI.BulbGrace/>
  }
  else if(expireType === LicenseBannerTypeEnum.expired ||
    expireType === LicenseBannerTypeEnum.msp_expired ||
    expireType === LicenseBannerTypeEnum.ra_below_50_percent
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
interface ContentInfo {
  btnText?: number
  content?: string
}

const getExpireInfo = (bannerList:EntitlementBanner[])=>{
  const expireList:ExpireInfo[] = []
  if(!_.isEmpty(bannerList)){
    bannerList.forEach(item => {
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
  const { $t } = useIntl()
  const { isMSPUser } = props
  const [expireList, setExpireList] = useState<ExpireInfo[]>([])
  const [showList, setShowList] = useState<boolean>(false)
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
    return LicenseBannerRemindMapping(expireInfo)[expireInfo.expireType]
  }

  const getDescContent = (expireInfo:ExpireInfo)=>{
    return LicenseBannerDescMapping(expireInfo)[expireInfo.expireType]
  }

  const getIsExpired = (expireInfo:ExpireInfo)=>
    expireInfo.expireType===LicenseBannerTypeEnum.expired ||
    expireInfo!.expireType===LicenseBannerTypeEnum.gracePeriod ||
    expireInfo.expireType===LicenseBannerTypeEnum.msp_expired ||
    expireInfo.expireType===LicenseBannerTypeEnum.ra_below_50_percent


  const getCardItem = (expireInfo:ExpireInfo, descTips:ContentInfo) => {
    const isExpired = getIsExpired(expireInfo)
    return <>
      <UI.LicenseIconWrapper>
        <UI.LayoutIcon children={getBulbIcon(expireInfo.expireType)} />
      </UI.LicenseIconWrapper>
      <UI.TipsWrapper>
        <UI.MainTips expired={isExpired} children={getMainTipsContent(expireInfo)}/>
        <UI.SubTips expired={isExpired}>
          <>
            {descTips?.content}
            <UI.ActiveBtn bold={expireInfo.deviceType !=='ANALYTICS'} expired={isExpired}>
              {descTips?.btnText}
            </UI.ActiveBtn>
          </>
        </UI.SubTips>
      </UI.TipsWrapper>
    </>
  }
  const multipleRender = () => {
    const expandBtn = <UI.LicenseWarningBtn
      data-testid='arrowBtn'
      expanded={showList}
      onClick={()=>{setShowList(!showList)}}>
      <UI.WarningBtnContainer>
        <UI.ContentWrapper>
          <UI.LicenseIconWrapper>
            <UI.LayoutIcon children={<UI.Expired/>} />
          </UI.LicenseIconWrapper>
          <UI.TipsWrapper>
            <UI.MainTips>
              {$t({ defaultMessage: 'Subscriptions require your attention' })}
            </UI.MainTips>
          </UI.TipsWrapper>
        </UI.ContentWrapper>
        <UI.CaretDown style={{ alignSelf: 'center' }}/>
      </UI.WarningBtnContainer>

    </UI.LicenseWarningBtn>
    if(!showList){
      return expandBtn
    }

    return <div>
      <UI.LicenseContainer>
        {expandBtn}
        {expireList.map((expireInfo, index) => {
          let showBorder = false
          if(index>0){
            let previous = expireList[index-1]
            const prevIsExpired = getIsExpired(previous)
            const curIsExpired = getIsExpired(expireInfo)
            if(!prevIsExpired && !curIsExpired) {
              showBorder = true
            }
          }
          const descTips = getDescContent(expireInfo)
          const isExpired = getIsExpired(expireInfo)
          return <UI.LicenseGrid expired={isExpired} showBorder={showBorder}>
            { getCardItem(expireInfo, descTips as ContentInfo) }
          </UI.LicenseGrid>
        })}
      </UI.LicenseContainer>
    </div>
  }

  const licenseRender = ()=>{
    if(expireList && expireList.length===1){
      const expireInfo = _.first(expireList)
      const subTips = expireInfo && getDescContent(expireInfo)
      const isExpired = expireInfo && getIsExpired(expireInfo)
      return <UI.LicenseContainerSingle expired={isExpired}>
        { getCardItem(expireInfo!, subTips as ContentInfo) }
      </UI.LicenseContainerSingle>
    }
    return multipleRender()
  }

  return <> { !_.isEmpty(expireList) && licenseRender()}
  </>
}
