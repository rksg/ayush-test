import { EdgePortsForm }                         from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const Ports = (props: { clusterId: string }) => {
  const { clusterId } = props
  const { serialNumber, activeSubTab } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit/ports`)
  const linkToEdgeList = useTenantLink('/devices/edge')

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  const onCancel = () => {
    navigate(linkToEdgeList)
  }

  return <EdgePortsForm
    clusterId={clusterId}
    serialNumber={serialNumber!}
    onTabChange={onTabChange}
    onCancel={onCancel}
    activeSubTab={activeSubTab}
  />
}

export default Ports