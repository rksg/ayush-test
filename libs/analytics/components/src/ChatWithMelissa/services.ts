// const GPT_URL_ORIGIN=window.location.origin
// const GPT_URL_BASE_PATH='/analytics'
// const GPT_ROUTE_PATH='/api/rsa-mlisa-gpt'

// To connect with local GPT repo
const GPT_URL_ORIGIN='http://localhost:8000'
const GPT_URL_BASE_PATH=''
const GPT_ROUTE_PATH=''




export const getSummary = async ()=>{
  const apiEndpoint ='/ruckus_analytics/summary'
  const gptBaseUrl = `${GPT_URL_ORIGIN}${GPT_URL_BASE_PATH}${GPT_ROUTE_PATH}`
  const summaryApiUrl = `${gptBaseUrl}${apiEndpoint}`
  const body={}
  const response= await fetch(summaryApiUrl,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  const json = await response.json()
  return json
}