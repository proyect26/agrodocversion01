# Manual de Usuario - AgroDocs 🌸

**Plataforma Integral de Gestión de Etiquetas, Facturación y Agronomía Florícola**

---

## 🔐 Credenciales de Acceso

| Usuario / Empresa | Correo Electrónico | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| **Angel's Blooms Florícola** | `aloelian84@gmail.com` | `654321` | Administrador Principal |
| **Cuenta Demo** | `demo@agrodocs.com` | `123456` | Usuario de Prueba |

---

## 🚀 Inicio de Sesión y Registro de Usuarios

1. **Pantalla de Login**: Al ingresar a la plataforma, visualice la información del sistema a la izquierda y el formulario de autenticación a la derecha.
2. **Botones de Acceso Rápido**: Puede hacer clic directo en **Angel's Blooms** o **Cuenta Demo** para ingresar sin digitar datos.
3. **Registro de Nuevos Usuarios**: Haga clic en la pestaña **Registrarse**, ingrese la Florícola/Empresa, Nombre Completo, Correo y Contraseña. El sistema guardará la cuenta e iniciará sesión automáticamente en su dashboard.
4. **Cerrar Sesión**: Haga clic en el botón **Salir** con icono rojo ubicado en la barra superior cuando termine sus labores.

---

## 📋 Módulos y Funcionalidades del Dashboard

### 1. 🏷️ Emisión de Facturas y Etiquetas
- **Datos del Cliente**: Seleccione o ingrese Consignatario, RUC/TAX ID, País de Destino y Agencia de Carga.
- **Detalle de Flor**: Seleccione la Variedad/Color (*Pink Floyd, Orange, Yellow, White, Lavender, Red, Bicolor*), tipo de caja (HB, QB) y número de cajas.
- **Impresión**: Al hacer clic en **Guardar e Imprimir Documento**, el sistema registra la factura y prepara las etiquetas térmicas con código de barras correlativo.

### 2. 🖨️ Lotes & Impresión de Etiquetas
- Despliega las etiquetas de exportación con formato normado.
- Incluye: Nombre de la Florícola, Cliente Consignatario, Marca, Variedad, Tipo de Caja (HB/QB), Cantidad de Tallos y Código de Barras escaneable.

### 3. 🚚 Hojas de Ruta y Resumen Logístico
- Generación de guías de despacho para choferes y transporte frigorífico hacia el aeropuerto.
- Desglose de placas de camión, cajas acumuladas HB/QB y consolidado del día o mes.

### 4. 🧠 Nodo de Decisiones (Analítica Comercial)
- **Variedades & Colores**: Análisis de ventas en dólares ($) y volumen por color/variedad de flor.
- **Ranking de Clientes**: Identificación de los mayores compradores y saldo en cartera.
- **Asistente IA**: Consultas interactivas sobre rendimiento de ventas.

### 5. 🌿 Guía Agronómica de Cultivo
- **Calendario Cosecha**: Fechas clave de siembra proyectadas para San Valentín (14 Feb), Día de la Madre, Día de la Mujer y Navidad.
- **Cuarto Frío y Poscosecha**: Parámetros térmicos (2°C a 4°C, 90-95% humedad) y apertura de botón floral.
- **Control Fitosanitario**: Diagnóstico de Botrytis, Trips, Mildiu y Fusarium.

### 6. 📖 Manual Interactivo
- Acceso directo en la pestaña **Manual** con buscador interno para consultar cualquier duda operacional paso a paso dentro de la app.

---

## 📱 Instalación como App Móvil (APK Android)
Para generar e instalar la APK en teléfonos o tablets Android:
1. Instale las herramientas de Capacitor en su proyecto: `npm install @capacitor/core @capacitor/cli @capacitor/android`
2. Construya la versión estática: `npm run build`
3. Sincronice con Android: `npx cap add android && npx cap sync`
4. Abra en Android Studio: `npx cap open android` y seleccione **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. Copie el archivo `app-debug.apk` resultante a su celular y toque para instalar.

---

## 📤 Exportación a GitHub
Todos los archivos del proyecto (incluyendo `README.md` y `MANUAL_USUARIO.md`) están completamente guardados y sincronizados.
Para subirlos a su repositorio de GitHub:
1. Abra el menú de **Ajustes / Configuración** en la esquina superior de AI Studio.
2. Seleccione la opción **Exportar a GitHub** (o Export ZIP).
3. Seleccione su repositorio de GitHub para sincronizar todos los cambios automáticamente.
