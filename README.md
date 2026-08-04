# AgroDocs - Plataforma de Gestión Florícola & Exportación 🌸

**AgroDocs** es la solución integral para florícolas y exportadores de flores (*Angel's Blooms, Rosas, Alhelí y Flores Verdes*). Permite la gestión comercial, etiquetado técnico con código de barras, emisión de comprobantes, hojas de ruta logística, analítica de variedades y asesoría agronómica inteligente.

---

## 🔐 Credenciales de Acceso Predeterminadas

| Usuario / Empresa | Correo Electrónico | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| **Angel's Blooms Florícola** | `aloelian84@gmail.com` | `654321` | Administrador Principal |
| **Cuenta Demo** | `demo@agrodocs.com` | `123456` | Usuario de Prueba |

> 💡 *En la pantalla de Login puede ingresar directamente usando los botones de acceso rápido o registrando una nueva florícola.*

---

## 💻 Requisitos Previos

Asegúrese de tener instalados los siguientes componentes en su máquina o servidor:

* **Node.js**: Versión 18.0.0 o superior ([Descargar Node.js](https://nodejs.org/))
* **npm**: Versión 9.0.0 o superior (incluido con Node.js) o `yarn` / `pnpm`
* **Git**: Para clonar el repositorio ([Descargar Git](https://git-scm.com/))

---

## 🛠️ Instalación en Entorno Local

1. **Clonar el repositorio de GitHub**:
   ```bash
   git clone https://github.com/TU_USUARIO/agrodocs.git
   cd agrodocs
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo (Modo Web)**:
   ```bash
   npm run dev
   ```
   Abre tu navegador en `http://localhost:3000` o la URL indicada en la consola.

4. **Ejecutar en Modo Escritorio (Electron - Opcional)**:
   ```bash
   npm run desktop:dev
   ```

---

## 🏗️ Compilación y Construcción (Build)

### 1. Generar Build Web de Producción
```bash
npm run build
```
Esto genera la carpeta dist/ con los archivos estáticos optimizados listos para desplegar en cualquier servidor Web o CDN.

### 2. Probar la versión de producción en local
```bash
npm run preview
```

### 3. Generar Ejecutable de Escritorio (.exe para Windows)
```bash
npm run desktop:build
```
Genera los archivos de instalación `.exe` (NSIS y Portable) en la carpeta `release/`.

### 4. Generar App Móvil Android (.apk para celulares y tablets)
Para empaquetar e instalar la aplicación localmente como una **APK Android** en dispositivos móviles usando **Capacitor**:

1. **Instalar dependencias de Capacitor** (en la raíz de su proyecto local):
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Inicializar Capacitor** (si es la primera vez):
   ```bash
   npx cap init AgroDocs com.agrodocs.app --web-dir dist
   ```

3. **Construir el proyecto web y sincronizar con Android**:
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   ```

4. **Abrir y generar la APK en Android Studio**:
   ```bash
   npx cap open android
   ```
   * En Android Studio, vaya al menú superior **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   * Una vez completado, haga clic en *locate* para obtener el archivo `app-debug.apk` generado en `android/app/build/outputs/apk/debug/`.

5. **Instalación Directa en el Dispositivo Móvil**:
   * Copie el archivo `.apk` a su teléfono Android mediante cable USB o WhatsApp/Drive.
   * En su celular, active la opción *"Permitir instalar aplicaciones de fuentes desconocidas"*.
   * Toque el archivo `.apk` para instalar AgroDocs como aplicación nativa Android.

---

## 🚀 Guía de Despliegue en Producción

### Opción A: Despliegue en Vercel (Recomendado para Web)
1. Conecte su cuenta de GitHub a [Vercel](https://vercel.com/).
2. Seleccione **Import Project** y elija este repositorio.
3. Vercel detectará automáticamente **Vite**.
4. Haga clic en **Deploy**. ¡Listo en menos de 1 minuto!

### Opción B: Despliegue en Netlify
1. Vaya a [Netlify](https://www.netlify.com/) y seleccione **New site from Git**.
2. Configuración de Build:
   * **Build Command**: `npm run build`
   * **Publish directory**: `dist`
3. Haga clic en **Deploy Site**.

### Opción C: Despliegue en Cloud Run / Docker
1. Cree un archivo `Dockerfile` en la raíz del proyecto:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```
2. Construya e impulse la imagen:
   ```bash
   docker build -t agrodocs .
   docker run -p 8080:80 agrodocs
   ```

### Opción D: Servidor VPS propio con Nginx
1. Ejecute `npm run build` en su servidor o CI/CD.
2. Copie el contenido de `dist/` a `/var/www/agrodocs`.
3. Configure Nginx (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name agrodocs.tu-dominio.com;
       root /var/www/agrodocs;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
4. Reinicie Nginx: `sudo systemctl restart nginx`.

---

## 📋 Módulos Principales del Sistema

1. **Editor de Facturas & Etiquetas**: Emisión de comprobantes de exportación, consignatario, tipo de caja (HB/QB), variedad y color.
2. **Impresión de Etiquetas con Código de Barras**: Etiquetado térmico normalizado para cajas de flor.
3. **Control de Despachos & Choferes**: Hojas de ruta para camiones frigoríficos hacia aeropuerto.
4. **Nodo de Decisiones (Analítica IA)**: Dashboard interactivo de variedades top (Pink Floyd, Orange, Yellow, White) y clientes con saldos.
5. **Guía Agronómica de Cultivo**: Parámetros de temperatura, humedad, poscosecha, cuarto frío y fechas clave de siembra (San Valentín, Día de la Madre).
6. **Manual Interactivo**: Guía de uso completa dentro del sistema con buscador dinámico.

---

## 📄 Licencia y Créditos
Desarrollado para **Angel's Blooms Florícola** & Exportadores de Flores. Todos los derechos reservados.
