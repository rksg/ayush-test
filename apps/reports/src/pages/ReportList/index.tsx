import { useIntl, defineMessage } from 'react-intl'

import { PageHeader, GridRow, GridCol, RadioCard } from '@acx-ui/components'
import { Features, useIsSplitOn }                  from '@acx-ui/feature-toggle'
import { useNavigate, useTenantLink }              from '@acx-ui/react-router-dom'

export function ReportList () {
  const { $t } = useIntl()

  /* eslint-disable max-len */
  const reports = [
    {
      title: $t({ defaultMessage: 'Overview' }),
      description: $t({ defaultMessage: 'Summary of critical metrics across the network' }),
      path: 'overview'
    },
    {
      title: $t({ defaultMessage: 'Access Points' }),
      description: $t({ defaultMessage: 'Details of inventory, models, reboots, software versions, alarms' }),
      path: 'aps'
    },
    {
      title: $t({ defaultMessage: 'Airtime Utilization' }),
      description: $t({ defaultMessage: 'Top access points by airtime utilization, by radio band and trend' }),
      path: 'airtime'
    },
    {
      title: $t({ defaultMessage: 'Applications' }),
      description: $t({ defaultMessage: 'Top applications and traffic distribution by clients and trend' }),
      path: 'applications'
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      description: $t({ defaultMessage: 'Details of switch inventory including models and software versions' }),
      path: 'switches'
    },
    {
      title: $t({ defaultMessage: 'Wired' }),
      description: $t({ defaultMessage: 'Details of switch traffic, traffic distribution, PoE usage and error over time' }),
      path: 'wired'
    },
    {
      title: $t({ defaultMessage: 'Wireless' }),
      description: $t({ defaultMessage: 'Details of access point traffic, client and trends by AP, Wi-Fi network, radio or clients over time' }),
      path: 'wireless'
    },
    {
      title: $t({ defaultMessage: 'Wireless Clients' }),
      description: $t({ defaultMessage: 'Top clients by traffic, by OS, by manufacturer, authentication modes' }),
      path: 'clients'
    },
    {
      title: $t({ defaultMessage: 'WLANs' }),
      description: $t({ defaultMessage: 'Top Wi-Fi networks by traffic, client count and trends' }),
      path: 'wlans'
    }
  ]
  /* eslint-enable */

  const navigate = useNavigate()
  const basePath = useTenantLink('/reports')
  const viewText = defineMessage({ defaultMessage: 'View' })
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Reports' })}
        breadcrumb={isNavbarEnhanced
          ? [{ text: $t({ defaultMessage: 'Business Insights' }) }]
          : undefined
        }
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
