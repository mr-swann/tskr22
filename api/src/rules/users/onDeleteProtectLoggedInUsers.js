const { db } = require('../../lib/db')
module.exports = {
  active: true,
  order: 1,
  when: ['before'],
  operation: ['delete'],
  table: 'user',
  file: __filename,
  command: async function ({ id, status }) {
    if (context.currentUser.id === id) {
      status.code = 'failure'
      status.message = `${record.name} are protected PUNK, cannot delete`
    }
    return await { id, status }
  },
}
