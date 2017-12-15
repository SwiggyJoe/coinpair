export function socketConnected(socket) {
  return {
    type: 'SOCKET_CONNECTED',
    payload: socket
  }
}

export function socketDisconnected() {
  return {
    type: 'SOCKET_DISCONNECTED'
  }
}
