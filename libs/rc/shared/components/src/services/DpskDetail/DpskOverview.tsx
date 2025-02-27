
import { Card, GridCol, GridRow, SummaryCard }      from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  DpskNetworkType,
  DpskSaveData,
  displayDefaultAccess,
  displayDeviceCountLimit,
  transformAdvancedDpskExpirationText,
  transformDpskNetwork,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { RolesEnum } from '@acx-ui/types'
import { hasRoles }  from '@acx-ui/user'
import { getIntl }   from '@acx-ui/utils'

import { IdentityGroupLink } from '../../CommonLinkHelper'

import DpskInstancesTable from './DpskInstancesTable'

interface DpskOverviewProps {
  data?: DpskSaveData
}

export function DpskOverview (props: DpskOverviewProps) {
  const intl = getIntl()
  const { isTemplate } = useConfigTemplate()
  const isCloudpathEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA) && !isTemplate
  const isTableBlocked = hasRoles([RolesEnum.DPSK_ADMIN, RolesEnum.GUEST_MANAGER])
  const { data } = props
  const isIdentityGroupRequired = useIsSplitOn(Features.DPSK_REQUIRE_IDENTITY_GROUP) && !isTemplate
  const isDpskRole = hasRoles(RolesEnum.DPSK_ADMIN)

  const dpskInfo = [
    {
      title: intl.$t({ defaultMessage: 'Passphrase Format' }),
      content: data && transformDpskNetwork(intl, DpskNetworkType.FORMAT, data.passphraseFormat)
    },
    {
      title: intl.$t({ defaultMessage: 'Passphrase Length' }),
      content: data && transformDpskNetwork(intl, DpskNetworkType.LENGTH, data.passphraseLength)
    },
    {
      title: intl.$t({ defaultMessage: 'Passphrase Expiration' }),
      content: data && transformAdvancedDpskExpirationText(
        intl,
        {
          expirationType: data.expirationType,
          expirationDate: data.expirationDate,
          expirationOffset: data.expirationOffset
        }
      )
    },
    {
      title: intl.$t({ defaultMessage: 'Devices allowed per passphrase' }),
      content: data && displayDeviceCountLimit(data.deviceCountLimit),
      visible: isCloudpathEnabled
    },
    {
      title: intl.$t({ defaultMessage: 'Default Access' }),
      content: data && displayDefaultAccess(data.policyDefaultAccess),
      visible: isCloudpathEnabled
    },
    ...(isIdentityGroupRequired ? [{
      title: intl.$t({ defaultMessage: 'Identity Group' }),
      content: <IdentityGroupLink
        enableFetchName
        disableLink={isDpskRole}
        personaGroupId={data?.identityId}
      />,
      colSpan: 5
    }] : [])
  ]

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <SummaryCard data={dpskInfo} />
      </GridCol>
      {isTableBlocked
        ? null
        : <GridCol col={{ span: 24 }}>
          <Card>
            <DpskInstancesTable networkIds={data?.networkIds} />
          </Card>
        </GridCol>}
    </GridRow>
  )
}
