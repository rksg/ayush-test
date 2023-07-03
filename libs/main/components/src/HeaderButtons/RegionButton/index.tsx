import { useEffect, useState } from 'react'

import { Menu } from 'antd'
import _        from 'lodash'

import {
  LayoutUI,
  Dropdown
}                        from '@acx-ui/components'
import {
  WorldSolid,
  ArrowExpand
} from '@acx-ui/icons'
import {
  useGetMspEcProfileQuery
} from '@acx-ui/msp/services'
import { MSPUtils }                           from '@acx-ui/msp/utils'
import { RegionValue, useUserProfileContext } from '@acx-ui/user'
import { useTenantId }                        from '@acx-ui/utils'

const mspUtils = MSPUtils()

export default function RegionButton () {
  const params = { tenantId: useTenantId() }

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
  },[userProfile, mspEcProfileData])

  const getRegionURL = (region:string) => {
    const currentRegion = userProfile!.allowedRegions
      .find(r => r.name === region)
    return currentRegion!.link
  }

  const regionMenu = <Menu
    selectable
    onClick={(e) => {
      const region = _.find(userProfile?.allowedRegions,(item)=>{
        return e.key===item.name
      })
      if(region && region.current) return
      window.location.href = getRegionURL(e.key)
    }}
    defaultSelectedKeys={[_.find(userProfile?.allowedRegions,(item)=>{
      return item.current
    })?.name||'']}
    items={
      // eslint-disable-next-line max-len
      (userProfile && userProfile.allowedRegions) ? userProfile.allowedRegions.map((region:RegionValue) => {
        return {
          key: region['name'],
          label: region['name']
        }
      }) : []
    }
  />

  return regionEnable
    ? <Dropdown overlay={regionMenu}>{(selectedKeys) => <LayoutUI.DropdownText>
      <LayoutUI.Icon children={<WorldSolid />} />
      {selectedKeys}
      <LayoutUI.Icon children={<ArrowExpand />} />
    </LayoutUI.DropdownText>}</Dropdown>
    : null
}
