import { useEffect, useState } from 'react'

import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  LayoutUI,
  Dropdown
}                        from '@acx-ui/components'
import {
  WorldSolid,
  ArrowExpand
} from '@acx-ui/icons'
import { useUserProfileContext } from '@acx-ui/rc/components'
import {
  useGetMspEcProfileQuery
} from '@acx-ui/rc/services'
import { MSPUtils, RegionValue } from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export default function RegionButton () {
  const { $t } = useIntl()
  const params = useParams()
  const mspUtils = MSPUtils()

  const { data: userProfile } = useUserProfileContext()
  const { data: mspEcProfileData } = useGetMspEcProfileQuery({ params })

  const [regionEnable, setRegionEnable] = useState<boolean>(false)

  useEffect(()=>{
    if(userProfile && mspEcProfileData){
      const isMspEc = mspUtils.isMspEc(mspEcProfileData)
      if((userProfile.support || userProfile.dogfood || userProfile.var)
      && userProfile.tenantId === userProfile.varTenantId
      && !isMspEc && userProfile.allowedRegions.length > 1){
        setRegionEnable(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[userProfile, mspEcProfileData])

  const getRegionURL = (region:string) => {
    if(userProfile){
      const currentRegion = userProfile.allowedRegions
        .find(r => r.name === region)
      return currentRegion!.link
    }else{
      return ''
    }
  }

  const regionMenu = <Menu
    selectable
    defaultSelectedKeys={['US']}
    items={
      userProfile ? userProfile.allowedRegions.map((region:RegionValue) => {
        return {
          key: region['name'],
          label: <TenantLink to={getRegionURL(region['name'])}>
            {region['name']}
          </TenantLink> }
      }) : []
    }
  />

  // eslint-disable-next-line max-len
  return <UI.RegionWrapper> {regionEnable && <Dropdown overlay={regionMenu}>{(selectedKeys) => <LayoutUI.DropdownText>
    <LayoutUI.Icon children={<WorldSolid />} />
    {selectedKeys}
    <LayoutUI.Icon children={<ArrowExpand />} />
  </LayoutUI.DropdownText>}</Dropdown>}
  </UI.RegionWrapper>
}
