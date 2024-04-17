import { useIntl, defineMessage } from 'react-intl'

import { PageHeader, GridRow, GridCol, RadioCard } from '@acx-ui/components'
import { useNavigate, useTenantLink }              from '@acx-ui/react-router-dom'
import { SwitchScopes, WifiScopes, hasPermission } from '@acx-ui/user'

export function ReportList () {
  const { $t } = useIntl()
  const hasReadWifiPermission = hasPermission({ scopes: [WifiScopes.READ] })
  const hasReadSwitchPermission = hasPermission({ scopes: [SwitchScopes.READ] })

  /* eslint-disable max-len */
  const reports = [
    {
      title: $t({ defaultMessage: 'Overview' }),
      description: $t({ defaultMessage: 'Summary of critical metrics across the network' }),
      path: 'overview'
    },
    ...( hasReadWifiPermission ? [{
      title: $t({ defaultMessage: 'Access Points' }),
      description: $t({ defaultMessage: 'Details of inventory, models, reboots, software versions, alarms' }),
      path: 'aps'
    }] : []),
    ...( hasReadWifiPermission ? [{
      title: $t({ defaultMessage: 'Airtime Utilization' }),
      description: $t({ defaultMessage: 'Top access points by airtime utilization, by radio band and trend' }),
      path: 'airtime'
    }] : []),
    ...( hasReadWifiPermission ? [{
      title: $t({ defaultMessage: 'Applications' }),
      description: $t({ defaultMessage: 'Top applications and traffic distribution by clients and trend' }),
      path: 'applications'
    }] : []),
    ...( hasReadSwitchPermission ? [{
      title: $t({ defaultMessage: 'Switches' }),
      description: $t({ defaultMessage: 'Details of switch inventory including models and software versions' }),
      path: 'switches'
    }] : []),
    ...( hasReadSwitchPermission ? [{
      title: $t({ defaultMessage: 'Wired' }),
      description: $t({ defaultMessage: 'Details of switch traffic, traffic distribution, PoE usage and error over time' }),
      path: 'wired'
    }] : []),
    ...( hasReadWifiPermission ? [{
      title: $t({ defaultMessage: 'Wireless' }),
      description: $t({ defaultMessage: 'Details of access point traffic, client and trends by AP, Wi-Fi network, radio or clients over time' }),
      path: 'wireless'
    }] : []),
    ...( hasReadWifiPermission ? [{
      title: $t({ defaultMessage: 'Wireless Clients' }),
      description: $t({ defaultMessage: 'Top clients by traffic, by OS, by manufacturer, authentication modes' }),
      path: 'clients'
    }] : []),
    ...( hasReadWifiPermission ? [{
      title: $t({ defaultMessage: 'WLANs' }),
      description: $t({ defaultMessage: 'Top Wi-Fi networks by traffic, client count and trends' }),
      path: 'wlans'
    }] : [])
  ]
  /* eslint-enable */

  const navigate = useNavigate()
  const basePath = useTenantLink('/reports')
  const viewText = defineMessage({ defaultMessage: 'View' })

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Reports' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Business Insights' }) }]}
      />
      <GridRow>
        {reports.map(({ title, description, path }) => (
          <GridCol key={path} col={{ span: 6 }}>
            <RadioCard
              type='button'
              buttonText={viewText}
              title={title}
              description={description}
              value={path}
              onClick={() => navigate({
                ...basePath,
                pathname: `${basePath.pathname}/${path}`
              })}
            />
          </GridCol>
        ))
        }
      </GridRow>
    </>
  )
}
