import { useRef } from 'react'

import {
  MenuOutlined
} from '@ant-design/icons'
import { FormInstance }     from 'antd'
import { TransferItem }     from 'antd/lib/transfer'
import { useDrop, useDrag } from 'react-dnd'

import { cssStr }          from '@acx-ui/components'
import { AAA_SERVER_TYPE } from '@acx-ui/rc/utils'

export const AAADraggableItem = ({ item, form, fieldName }: {
  item: TransferItem,
  form: FormInstance,
  fieldName: string
}) => {
  const ref = useRef<HTMLDivElement>(null)

  const targetKeys = form.getFieldValue(fieldName) as string[]

  const index = targetKeys.findIndex(i => item.key === i)

  const moveRow = async (fromIndex: number, toIndex: number) => {
    const clonedList = [...targetKeys]
    const el = clonedList.splice(fromIndex, 1)[0]
    clonedList.splice(toIndex, 0, el)

    form.setFieldValue(fieldName, clonedList)
  }

  const isNoneItem = item.key === AAA_SERVER_TYPE.NONE

  const [{ isOver, dropStyle }, drop] = useDrop({
    accept: 'DraggableItem',
    collect: (monitor) => {
      const dragItem = monitor.getItem()

      if (!dragItem || dragItem.index === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropStyle: isNoneItem ? {} : dragItem.index < index ?
          { borderBottom: '2px dashed ' + cssStr('--acx-accents-blue-50') } :
          { borderTop: '2px dashed ' + cssStr('--acx-accents-blue-50') }
      }
    },
    drop: (dragItem: { index: number }) => {
      if (!isNoneItem) {
        moveRow(dragItem.index, index)
      }
    }
  })

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'DraggableItem',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  preview(drop(ref))

  return (<div
    key={item.key}
    ref={ref}
    style={{
      ...(isOver ? dropStyle : {}),
      ...(isDragging ? { opacity: 0.5 } : {}),
      position: 'relative'
    }}
  >
    <span className='label'>{item.name}</span>
    { index !== -1 && (
      <span ref={isNoneItem ? null : drag} style={{ position: 'absolute', right: 0 }}>
        <MenuOutlined style={isNoneItem ?
          { color: cssStr('--acx-neutrals-40') } :
          { cursor: 'move' }}/>
      </span>
    )}
  </div>)
}
