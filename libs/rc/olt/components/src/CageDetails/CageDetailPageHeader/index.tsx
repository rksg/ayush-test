import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { Olt, OltCage }       from '@acx-ui/olt/utils'
import { useParams }          from '@acx-ui/react-router-dom'
import { filterByAccess }     from '@acx-ui/user'
import { noDataDisplay }      from '@acx-ui/utils'

import { ManageOntsDrawer }                 from '../../ManageOntsDrawer'
import { OltStatus }                        from '../../OltStatus'
import { useCageDetails, useDrawerActions } from '../cageDetailsState'

export function CageDetailPageHeader (props: {
  oltDetails: Olt
  cageDetails: OltCage
}) {
  const { $t } = useIntl()
  const { oltId, venueId } = useParams()
  const { oltDetails, cageDetails } = props
  const { state } = useCageDetails()
  const { closeManageOnts, openManageOnts, openEditOnt } = useDrawerActions()

  return (<>
    <PageHeader
      title={cageDetails?.cage || noDataDisplay}
      titleExtra={
        <OltStatus
          type='cage'
          status={cageDetails?.state}
          showText
        />
      }
      breadcrumb={[
        { text: 'Wired' },
        { text: 'Switches' },
        { text: 'Optical List', link: '/devices/optical' },
        { text: 'Cage List', link: `/devices/optical/${venueId}/${oltId}/details/overview/line` }, //TODO: check with UX
        { text: oltDetails?.name, link: `/devices/optical/${venueId}/${oltId}/details/overview` }
      ]}
      extra={[
        ...filterByAccess([
          <Button
            type='default'
            // rbacOpsIds={[]}
            // scopeKey={[]}
            onClick={openManageOnts}
          >{$t({ defaultMessage: 'Manage ONTs' })}</Button>
        ])
      ]}
    />
    <ManageOntsDrawer
      visible={state.drawers.manageOnts}
      onClose={closeManageOnts}
      onOpenEditOnt={openEditOnt}
    />
  </>)
}

