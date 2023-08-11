import { useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { IFrame } from '@acx-ui/components'

import { UIResizableBox, UIDraggable, UIModal } from './styledComponents'

import type { DraggableData, DraggableEvent } from 'react-draggable'
import type { ResizeCallbackData }            from 'react-resizable'

export function SwitchCliSession (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void,
  jwtToken: string,
  serialNumber: string,
  switchName: string
}) {
  const { $t } = useIntl()
  const token = props.jwtToken
  // eslint-disable-next-line max-len
  const url = window.location.origin + '/api/rpv2/rtty/switch/' + props.serialNumber + '?rid=ce142e2b-d716-4de2-8a9b-048a8162cdf9&token=' + token
  const { setIsModalOpen, modalState, switchName } = props

  // eslint-disable-next-line max-len
  const bannerMsg = $t({ defaultMessage: 'Telnet inside encrypted NATS session. Configuration changes made via CLI session may take up to 5 minutes to get updated on RUCKUS One interface.' })
  const title = $t({ defaultMessage: 'CLI Session - {switchName}' }, { switchName })

  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
  })
  const [disabled, setDisabled] = useState(false)
  const [height, setHeight] = useState(450)
  const [width, setWidth] = useState(750)

  const draggleRef = useRef<HTMLDivElement>(null)

  const onDragStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { innerHeight, innerWidth } = window
    const targetRect = draggleRef.current?.getBoundingClientRect()
    if (!targetRect) {
      return
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: innerWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: innerHeight - (targetRect.bottom - uiData.y)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onResize = (event: any, { size }: ResizeCallbackData) => {
    setHeight(size.height)
    setWidth(size.width)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  return (
    <UIModal
      title={
        <div
          style={{
            padding: '0px',
            width: '100%',
            cursor: 'move'
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false)
            }
          }}
          onMouseOut={() => {
            setDisabled(true)
          }}
        >
          {title}
        </div>
      }
      visible={modalState}
      footer={null}
      onCancel={handleCancel}
      destroyOnClose={true}
      modalRender={(modal) => (
        <UIDraggable
          disabled={disabled}
          bounds={bounds}
          onStart={(event, uiData) => onDragStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </UIDraggable>
      )}
      width={width}
    >
      <UIResizableBox
        width={width}
        height={height}
        minConstraints={[550, 200]}
        onResize={onResize}
      >
        <div
          className='dialog-wrapper'
          style={{ width: width, height: height }}
          onMouseOver={() => {
            setDisabled(true)
          }}
        >
          {
            <>
              <div style={{
                height: '50px',
                backgroundColor: '#F8F8FA',
                color: '#565758',
                padding: '8px 25px'
              }}>{bannerMsg}</div>
              <div>
                <IFrame
                  height={height-50}
                  width={width}
                  style={{ border: '0px' }}
                  title={$t({ defaultMessage: 'cli session' })}
                  src={url}/></div>
            </>
          }
        </div>
      </UIResizableBox>
    </UIModal>
  )
}



