import { OltOntPort } from '@acx-ui/olt/utils'

import { OntPortTable } from '../OntPortTable'

export const OntPortTab = (props: { data?: OltOntPort[] }) => {
  const { data } = props
  return <OntPortTable data={data} />
}