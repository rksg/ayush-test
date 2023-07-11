import { useEffect, useRef } from 'react'

export interface IFrameProps extends React.HTMLAttributes<HTMLIFrameElement> {
  src: string,
  height?: number,
  width?: number
}

export function IFrame ({...props}: IFrameProps) {

    const iframeRef = useRef(null);
    const observerRef = useRef<null | MutationObserver>(null);

    useEffect(() => {
        const handleIframeSrcChange = () => {
          console.log('src changed', (iframeRef?.current as any)?.src, props.src)

          const actualHost = props.src
          const newHost = (iframeRef?.current as any)?.src

          if (actualHost !== newHost)
              window.location.reload()
        }
    
        const observeIframeSrcChange = () => {
          observerRef.current = new MutationObserver((mutationsList) => {
            for (let mutation of mutationsList) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                handleIframeSrcChange();
                break;
              }
            }
          });
    
          if (iframeRef.current && observerRef.current) {
            observerRef.current.observe(iframeRef.current, { attributes: true });
          }
        };
    
        observeIframeSrcChange();
    
        return () => {
          // Cleanup function
          if (observerRef.current && iframeRef.current) {
            observerRef.current.disconnect();
          }
        };
      }, []);

  return (
    <iframe
        ref={iframeRef}
        {...props}
      />
  )
}
