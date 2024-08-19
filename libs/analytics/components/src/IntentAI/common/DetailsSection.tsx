import { Typography } from 'antd'

export const DetailsSection: React.FC<{
  title: React.ReactNode
  children: React.ReactNode
}> = (props) => <div style={{ marginBlockEnd: 40 }}>
  <Typography.Title level={3} children={props.title} />
  <div children={props.children} />
</div>
