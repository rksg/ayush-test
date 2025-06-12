import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from './baseQuery'

export const baseConfigTemplateApi = createApi({
  baseQuery: baseQuery,
  reducerPath: 'configTemplateApi',
  tagTypes: [
    'ConfigTemplate', 'AAATemplate', 'NetworkTemplate', 'VenueTemplate', 'VenueTemplateRadio',
    'VenueTemplateExternalAntenna', 'DpskTemplate', 'AccessControlTemplate', 'DhcpTemplate',
    'PortalTemplate', 'VenueTemplateSwitchAAA', 'WifiCallingTemplate', 'VlanPoolTemplate',
    'SyslogTemplate', 'RogueApTemplate', 'SwitchConfigProfileTemplate',
    'VenueTemplateApGroup', 'ApGroupTemplate', 'NetworkRadiusServerTemplate',
    'EthernetPortProfileTemplate', 'IdentityGroupTemplate'
  ],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})
