import { OltOntPort, OltSlotType } from '@acx-ui/olt/utils'

import { OltFrontPanel } from '../../OltFrontPanel'

export const OntOverviewTab = (props: { data?: OltOntPort[] }) => {
  const { data } = props
  return <OltFrontPanel data={[{
    type: OltSlotType.ONT,
    slots: data?.map(item => ({
      label: item.portIdx,
      status: item.status,
      taggedVlan: item.taggedVlan?.join(','),
      untaggedVlan: item.untaggedVlan?.join(',')
    }))
  }]} />
}
