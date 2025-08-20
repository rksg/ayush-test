import { OltOntClient } from '@acx-ui/olt/utils'

import { OntClientTable } from './OntClientTable'

export const OntClientTab = (props: {
  data?: OltOntClient[]
}) => {
  const { data } = props
  return <OntClientTable data={data} />
}
