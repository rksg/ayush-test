import {  Divider }               from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { PageHeader, GridRow, GridCol, RadioCard, Subtitle } from '@acx-ui/components'
import { Features }                                          from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                             from '@acx-ui/rc/components'
import { useNavigate, useTenantLink }                        from '@acx-ui/react-router-dom'

export function ReportList () {
  const { $t } = useIntl()

  const isEdgeAvReportReady = useIsEdgeFeatureReady(Features.EDGE_AV_REPORT_TOGGLE)

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
    },
    {
      title: $t({ defaultMessage: 'RUCKUS Edge Applications' }),
      description: $t({ defaultMessage: 'Top RUCKUS Edge applications and traffic distribution by clients and trend' }),
      path: 'edgeApplications',
      disabled: !isEdgeAvReportReady
    }
  ]
  const adhocReports = [
    {
      title: $t({ defaultMessage: 'Wireless : RSS and Traffic by Access Points' }),
      description: $t({ defaultMessage: 'Details of signal strength and traffic by Access points' }),
      path: 'rssTraffic'
    },
    {
      title: $t({ defaultMessage: 'Wireless : RSS and Session by Access Points' }),
      description: $t({ defaultMessage: 'Details of signal strength and session by Access points' }),
      path: 'rssSession'
    },
    {
      title: $t({ defaultMessage: 'Wireless : Airtime by Access Points' }),
      description: $t({ defaultMessage: 'Details of Airtime by Access points' }),
      path: 'wirelessAirtime'
    },
    {
      title: $t({ defaultMessage: 'Wireless : Traffic by Applications and Access Points' }),
      description: $t({ defaultMessage: 'Details of Traffic by Applications and Access points' }),
      path: 'trafficApplications'
    }
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
        {reports.map(({ title, description, path, disabled }) => (
          !disabled && (
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
          )
        ))
        }
      </GridRow>
      <Divider />
      <Subtitle level={2}>{$t({ defaultMessage: 'Adhoc Reports' })}</Subtitle>
      <GridRow>
        {adhocReports.map(({ title, description, path }) => (
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
