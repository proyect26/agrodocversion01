const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const nodemailer = require('nodemailer');

const isDev = !app.isPackaged;
const legacyDbPath = path.join(__dirname, '..', 'database.sqlite');
let db = null;

function initDatabase() {
  if (db) return db;

  const userDataDir = app.getPath('userData');
  fs.mkdirSync(userDataDir, { recursive: true });

  const dbPath = path.join(userDataDir, 'database.sqlite');
  if (!fs.existsSync(dbPath) && fs.existsSync(legacyDbPath)) {
    fs.copyFileSync(legacyDbPath, dbPath);
    console.log('Migrated legacy database to userData:', dbPath);
  }

  console.log('--- BASE DE DATOS LOCALIZADA EN ---');
  console.log(dbPath);
  console.log('----------------------------------');

  db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    type TEXT,
    dae TEXT,
    invoice_number TEXT,
    serie TEXT,
    fecha_factura TEXT,
    mawb TEXT,
    hawb TEXT,
    pais_destino TEXT,
    exportadora TEXT,
    producto TEXT,
    agencia TEXT,
    cliente TEXT,
    items_json TEXT,
    full_data_json TEXT,
    printDate TEXT
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    service TEXT,
    cedula TEXT,
    email TEXT,
    phone TEXT
  );

  CREATE TABLE IF NOT EXISTS supplier_records (
    id TEXT PRIMARY KEY,
    supplierId TEXT,
    date TEXT,
    bunches REAL,
    detail TEXT,
    quantity REAL,
    unitCost REAL,
    totalCost REAL,
    notes TEXT
  );

  CREATE TABLE IF NOT EXISTS supplier_prices (
    supplierId TEXT PRIMARY KEY,
    value REAL
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    supplierId TEXT,
    amount REAL,
    date TEXT,
    status TEXT,
    method TEXT,
    note TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT,
    cedula TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    notes TEXT
  );
`);

  const suppliersColumns = db.prepare("PRAGMA table_info(suppliers)").all().map((column) => column.name);
  if (!suppliersColumns.includes('cedula')) {
    db.exec('ALTER TABLE suppliers ADD COLUMN cedula TEXT');
  }
  if (!suppliersColumns.includes('email')) {
    db.exec('ALTER TABLE suppliers ADD COLUMN email TEXT');
  }
  if (!suppliersColumns.includes('phone')) {
    db.exec('ALTER TABLE suppliers ADD COLUMN phone TEXT');
  }

  const paymentsColumns = db.prepare("PRAGMA table_info(payments)").all().map((column) => column.name);
  if (!paymentsColumns.includes('method')) {
    db.exec('ALTER TABLE payments ADD COLUMN method TEXT');
  }
  if (!paymentsColumns.includes('note')) {
    db.exec('ALTER TABLE payments ADD COLUMN note TEXT');
  }

  return db;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// Handlers para IPC (Database)
ipcMain.handle('db-query', (event, { sql, params = [] }) => {
  try {
    const currentDb = initDatabase();
    const stmt = currentDb.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params);
    } else {
      return stmt.run(...params);
    }
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  }
});

// Handler para envío de correo con Nodemailer
ipcMain.handle('send-email', async (event, { smtpConfig, emailData }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: smtpConfig.secure === true || Number(smtpConfig.port) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: {
        rejectUnauthorized: false,  // útil para servidores self-signed
      },
    });

    // Verificar conexión SMTP
    await transporter.verify();

    const mailOptions = {
      from: `"${smtpConfig.fromName || 'FLORELI Sistema'}" <${smtpConfig.user}>`,
      to: emailData.to,
      cc: emailData.cc || undefined,
      subject: emailData.subject,
      html: emailData.body,
      attachments: emailData.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email Error:', err);
    return { success: false, error: err.message };
  }
});

// Handler para verificar conexión SMTP
ipcMain.handle('verify-smtp', async (event, smtpConfig) => {
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 587,
      secure: smtpConfig.secure === true || Number(smtpConfig.port) === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
      tls: { rejectUnauthorized: false },
    });
    await transporter.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (db) {
    db.close();
    db = null;
  }
});
