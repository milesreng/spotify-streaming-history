const endpoint = 'http://ip-api.com/json/?fields=status,message,countryCode'

export const getIPData = async (ip_addr: string) => {
  return await fetch(endpoint, {
    body: JSON.stringify({ ip_addr })
  })
}