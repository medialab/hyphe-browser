/**
 * Helper to retrieve some OpenStack server data's IP address:
 * @param openStackServer A full OpenStack server data object
 * @returns {string} The public IP address of Hyphe on that openStackServer
 */
export function getIP (openStackServer) {
  return Object.keys(openStackServer.addresses)
    .reduce((ips, key) => ips.concat(
      openStackServer.addresses[key]
        .filter(({ version }) => version === 4)
        .map(({ addr }) => addr)
    ), [])[0]
}

/**
 * Takes a cloud Hyphe server data, and returns the URL to its logs file:
 * @param hypheServer A full Hyphe server data object
 * @returns {string} The URL (or null for non-cloud Hyphe servers)
 */
export function getLogsURL (hypheServer) {
  return hypheServer.cloud ? hypheServer.url + '/logs' : null
}
