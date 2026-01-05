# Debts Frontend (Angular)

Frontend de la aplicación **APP Deudas**, desarrollado con **Angular 21**, que permite gestionar deudas, visualizar resúmenes, exportar información y operar contra un backend NestJS con autenticación basada en cookies.

---

## 🧰 Requisitos previos

Asegúrate de tener instalado lo siguiente:

- **Node.js** ≥ 20.x  
- **npm** ≥ 9.x  
- **Angular CLI** ≥ 21  
- Backend **Debts API** corriendo (ver README del backend)

Verificar versiones:

```bash
node -v
npm -v
ng version
```

---

## 📦 Instalación del proyecto

Clona el repositorio y entra al directorio:

```bash
git clone <url-del-repositorio>
cd debts-frontend
```

Instala las dependencias:

```bash
npm install
```

---

## ⚙️ Configuración de entorno

Verifica el archivo:

```text
src/environments/environment.ts
```

Debe apuntar correctamente al backend:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // URL del backend NestJS
};
```

⚠️ Importante:
- El backend debe permitir **CORS con credentials**
- El frontend usa **cookies HTTP Only** para autenticación

---

## 🚀 Ejecutar en modo desarrollo

Inicia el servidor de desarrollo:

```bash
ng serve
```

Luego abre en el navegador:

```
http://localhost:4200
```

La aplicación se recargará automáticamente cuando modifiques el código fuente.

---

## 🔐 Autenticación

Este frontend depende de un backend con autenticación activa.

Flujo esperado:
1. Iniciar sesión desde `/auth/login`
2. El backend setea la cookie de sesión
3. El frontend consume los endpoints con `withCredentials: true`

Si no estás autenticado, serás redirigido al login.

---

## 📊 Funcionalidades principales

- Listado de deudas
- Filtro por estado (Todas / Pendientes / Pagadas)
- Crear, ver, editar y eliminar deudas
- Marcar deuda como pagada
- Resumen visual (totales y cantidades)
- Gráficas de resumen
- Exportación a **CSV** y **JSON**
- UI moderna con SweetAlert2

---

## 🏗️ Build de producción

Generar build optimizado:

```bash
ng build
```

Los archivos se generarán en:

```text
dist/
```

---

## 🧠 Notas importantes

- El frontend **no funcionará correctamente** si el backend no está corriendo
- Redis debe estar activo si el backend usa cache

---

## 👤 Autor

Daniel Humberto Soto Rincón

dhsr03@gmail.com

3204236748