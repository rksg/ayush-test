import { useEffect, useRef } from 'react'

export function IFrame (props: React.IframeHTMLAttributes<HTMLIFrameElement>) {

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const handleIframeSrcChange = () => {

      const actualHost = props.src
      const newHost = (iframeRef?.current)?.src

      if (actualHost !== newHost)
        window.location.reload()
    }

    const observerRef = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          handleIframeSrcChange()
          break
        }
      }
    })

    if (iframeRef.current) {
      observerRef.observe(iframeRef.current, { attributes: true })
    }

    return () => {
    // Cleanup function
      observerRef.disconnect()
    }
  }, [])

  return (
    <iframe
      title={props.title}
      ref={iframeRef}
      {...props}
    />
  )
}
