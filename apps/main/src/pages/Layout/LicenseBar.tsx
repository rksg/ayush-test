import { useState, useEffect } from 'react'

import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  useEntitlementBannersQuery,
  useEntitlementListQuery
} from '@acx-ui/rc/services'
import {
  Entitlement
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

const MAX_SHOWBANNER_DAYS = 60

const getBulbIcon = (expireDays: number, graceDays:number = 999) => {
  if(expireDays<MAX_SHOWBANNER_DAYS && expireDays>7){
    return <UI.BulbLesserInitial/>
  }
  else if(expireDays<7 && expireDays>=0){
    return <UI.BulbLesser7/>
  }
  else if(expireDays<0 && graceDays>=0){
    return <UI.BulbGrace/>
  }
  else if(expireDays<0 && graceDays<0){
    return <UI.Expired/>
  }
  else {
    return <></>
  }
}
type EntitlementKeys = keyof Entitlement
const getRemainingDays = (entitlementList:Entitlement[], compareKey: EntitlementKeys )=>{
  const days = entitlementList?.map((item)=>{
    const newDate = new Date(item[compareKey])
    // expiration date should be end of UTC date
    newDate.setUTCHours(23)
    newDate.setUTCMinutes(59)
    newDate.setUTCSeconds(59)

    const hoursLeft = moment(newDate).diff(moment(), 'hours')
    return Math.round(hoursLeft / 24)
  })
  return _.min(days)
}

export default function LicenseBar () {
  const { $t } = useIntl()

  const [expireDays, setExpireDays] = useState<number>(999)
  const [graceDays, setGraceDays] = useState<number>(999)

  const params = useParams()

  const { data } = useEntitlementListQuery({ params })

  useEffect(() => {
    if(data){
      const expireNum = getRemainingDays(data, 'effectiveDate')
      !_.isUndefined(expireNum) && setExpireDays(expireNum)

      const graceNum = getRemainingDays(data, 'graceEndDate')
      !_.isUndefined(graceNum) && setGraceDays(graceNum)
    }

  },[data])

  return <UI.LicenseContainer expired={false}>
    <UI.LicenseIconWrapper>
      <UI.LayoutIcon children={getBulbIcon(expireDays, graceDays)} />
    </UI.LicenseIconWrapper>
    <UI.TipsWrapper>
      <UI.MainTips expired={false}>{$t({ defaultMessage:
        'Your subsciption for 20 APs expired. Grace period ends in 55 days' })}
      </UI.MainTips>
      <UI.SubTips>
        {$t({ defaultMessage: 'APs configuration will be deleted on 02/07/2022' })}
        {', '}
        <UI.ActiveBtn expired={false}>
          {$t({ defaultMessage: 'Act now' })}
        </UI.ActiveBtn>
      </UI.SubTips>
    </UI.TipsWrapper>
  </UI.LicenseContainer>
}
