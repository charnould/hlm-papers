/**
 * Check if newspaper title is relevant
 * @param {*} string title
 * @returns true/false
 */
export const is_relevant = (title) => {
  if (/hlm\b/gim.test(title)) return true
  if (/logement social/gim.test(title)) return true
  if (/logements sociaux/gim.test(title)) return true
  if (/bailleur social/gim.test(title)) return true
  if (/bailleurs sociaux/gim.test(title)) return true
  if (/action logement/gim.test(title)) return true
  if (/1% logement/gim.test(title)) return true
  if (/1 % logement/gim.test(title)) return true
  else return false
}

/**
 * Check if newspaper url is relevant
 * @param {*} string title
 * @returns true/false
 */
export const is_url_relevant = (title) => {
  if (/hlm/gim.test(title)) return true
  if (/logement-social/gim.test(title)) return true
  if (/logements-sociaux/gim.test(title)) return true
  if (/bailleur-social/gim.test(title)) return true
  if (/bailleurs-sociaux/gim.test(title)) return true
  if (/action-logement/gim.test(title)) return true
  if (/1-logement-/gim.test(title)) return true
  else return false
}

/**
 * Function to wait for a few seconds
 */
export function delay(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay)
  })
}

/**
 */
export const random_user_agent = () => {
  const user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36',
  ]
  const random = Math.floor(Math.random() * user_agents.length)
  return user_agents[random]
}
