import { useIntl, defineMessage } from 'react-intl'

import { PageHeader, GridRow, GridCol, RadioCard } from '@acx-ui/components'
import { useNavigate, useTenantLink }              from '@acx-ui/react-router-dom'

export function ReportList () {
  const { $t } = useIntl()

  const reports = [
    {
      title: $t({ defaultMessage: 'Overview' }),
      path: 'overview'
    },
    {
      title: $t({ defaultMessage: 'Wireless' }),
      path: 'wireless'
    },
    {
      title: $t({ defaultMessage: 'Wired' }),
      path: 'wired'
    },
    {
      title: $t({ defaultMessage: 'APs' }),
      path: 'aps'
    },
    {
      title: $t({ defaultMessage: 'Switches' }),
      path: 'switches'
    },
    {
      title: $t({ defaultMessage: 'WLANs' }),
      path: 'wlans'
    },
    {
      title: $t({ defaultMessage: 'Wireless Clients' }),
      path: 'clients'
    },
    {
      title: $t({ defaultMessage: 'Applications' }),
      path: 'applications'
    },
    {
      title: $t({ defaultMessage: 'Airtime Utilization' }),
      path: 'airtime'
    }
  ]

  const navigate = useNavigate()
  const basePath = useTenantLink('/reports')
  const viewText = defineMessage({ defaultMessage: 'View' })

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Reports' })} />
      <GridRow>
        {reports.map(({ title, path }) => (
          <GridCol key={path} col={{ span: 6 }}>
            <RadioCard
              type='button'
              buttonText={viewText}
              title={title}
              description=''
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
