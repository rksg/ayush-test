import { DeleteOutlined } from '@acx-ui/icons-new'

export function DynamicIcon () {
  return (<>
    <p>size='sm'</p>
    <DeleteOutlined size='sm' />
    <p>size='sm', color='red'</p>
    <DeleteOutlined size='sm' color='red' />
    <p>size='md' (default)</p>
    <DeleteOutlined />
    <p>size='lg'</p>
    <DeleteOutlined size='lg' />
  </>)
}
