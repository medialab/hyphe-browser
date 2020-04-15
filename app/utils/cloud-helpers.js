/**
 * Helper to retrieve some OpenStack server data's IP address:
 * @param server A full OpenStack server data object
 * @returns {string} The public IP address of Hyphe on that server
 */
export function getIP (server) {
  return Object.keys(server.addresses)
    .reduce((ips, key) => ips.concat(
      server.addresses[key]
        .filter(({ version }) => version === 4)
        .map(({ addr }) => addr)
    ), [])[0]
}

