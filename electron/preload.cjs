const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  platform: process.platform,
  dbQuery: (sql, params) => ipcRenderer.invoke('db-query', { sql, params }),
  sendEmail: (smtpConfig, emailData) => ipcRenderer.invoke('send-email', { smtpConfig, emailData }),
  verifySmtp: (smtpConfig) => ipcRenderer.invoke('verify-smtp', smtpConfig),
});
