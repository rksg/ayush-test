import { OntPortTable } from '@acx-ui/olt/components'
import { OltOntPort }   from '@acx-ui/olt/utils'

export const OntPortTab = (props: { data?: OltOntPort[] }) => {
  const { data } = props
  return <OntPortTable data={data} />
}