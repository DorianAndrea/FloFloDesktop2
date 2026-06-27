# FloFlo 💜

FloFlo es una aplicación web pensada para apoyar a niños y niñas autistas en la organización de sus rutinas, preparación de actividades, reconocimiento emocional y desarrollo de habilidades sociales. También incluye un panel para padres o cuidadores, donde pueden revisar avances, perfiles sensoriales, reportes y recomendaciones.

El objetivo de FloFlo es entregar una experiencia visual, amigable y estructurada, ayudando a anticipar situaciones, reforzar hábitos y acompañar el día a día de forma más clara y segura.

---

## 🌟 Funcionalidades principales

### 👧 Modo niño/a

* Registro e inicio de sesión.
* Gestión de emociones.
* Rutinas diarias con horarios y días de la semana.
* Separación entre rutinas pendientes y completadas.
* Historial de rutinas realizadas.
* Lugares importantes para preparar visitas o salidas.
* Generación de pasos con Félix para anticipar actividades.
* Amigos/contactos importantes.
* Conversaciones sociales asociadas a amigos.
* Conversaciones generales de práctica.
* Sistema de favoritos.
* Sistema de progreso, puntos y logros.
* Perfil personal.

---

### 👨‍👩‍👧 Modo padre/cuidador

* Acceso protegido según rol.
* Asociación padre-hijo.
* Panel de seguimiento del niño/a.
* Revisión de emociones, rutinas y avances.
* Perfil sensorial.
* Historial del perfil sensorial.
* Semáforo de bienestar.
* Plan semanal de apoyo.
* Historial de planes semanales.
* Dashboard de evolución.
* Recomendaciones de apoyo.
* Reporte PDF descargable.

---

## 🧠 Rutinas 2.0

El módulo de rutinas fue mejorado para funcionar de forma diaria y no solo como una lista simple.

Ahora permite:

* Crear rutinas con hora de inicio y término.
* Seleccionar días específicos de la semana.
* Ver rutinas programadas para hoy.
* Separar rutinas pendientes y completadas.
* Marcar una rutina como realizada solo una vez por día.
* Evitar sumar puntos duplicados el mismo día.
* Volver a completar la misma rutina al día siguiente.
* Mantener historial de rutinas realizadas por fecha.

---

## 🏆 Sistema de logros y progreso

FloFlo incluye un sistema de gamificación para reforzar positivamente el uso de la aplicación.

El niño/a puede ganar puntos al completar acciones como:

* Realizar rutinas.
* Completar conversaciones.
* Registrar emociones.
* Completar lugares.
* Desbloquear logros.

---

## 🧩 Perfil sensorial

El perfil sensorial permite registrar información importante sobre el niño/a, como:

* Sensibilidad al ruido.
* Sensibilidad a la luz.
* Sensibilidad a texturas.
* Sensibilidad a multitudes.
* Objetos que ayudan a calmarse.
* Actividades reguladoras.
* Señales de estrés.
* Estrategias de apoyo.
* Notas adicionales.

Este perfil puede ser revisado por el padre/cuidador y utilizado para generar recomendaciones y reportes.

---

## 📄 Reporte PDF

FloFlo permite generar un reporte PDF con información relevante del niño/a, incluyendo:

* Resumen general.
* Estado de bienestar.
* Perfil sensorial.
* Historial sensorial.
* Plan semanal de apoyo.
* Historial de planes.
* Dashboard de evolución.
* Tendencia emocional.
* Recomendaciones.

---

## 🛠️ Tecnologías utilizadas

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* React Router
* Axios
* Framer Motion

### Backend

* Node.js
* Express
* PostgreSQL
* JWT
* bcrypt
* PDFKit
* Resend para recuperación de contraseña

### Base de datos

* PostgreSQL
* Esquema principal: `"FloFlo"`

---

## 📁 Estructura general del proyecto

```txt
FloFloBackend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── database/
│   └── app.js

FloFloReact/floflo/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   └── App.jsx
```

---

## 🚀 Instalación y ejecución local

### 1. Clonar repositorios

```bash
git clone https://github.com/DorianAndrea/FloFloBackend.git
git clone https://github.com/DorianAndrea/FloFloDesktop2.git
```

---

### 2. Backend

Entrar a la carpeta del backend:

```bash
cd FloFloBackend
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env` con las variables necesarias:

```env
PORT=5001
DATABASE_URL=postgresql://usuario:password@host:puerto/database
JWT_SECRET=tu_secreto_jwt
FRONTEND_URL=http://localhost:5173
APP_TIMEZONE=America/Santiago
RESEND_API_KEY=tu_api_key
EMAIL_FROM=FloFlo <onboarding@resend.dev>
ALLOW_RESET_TOKEN_RESPONSE=false
```

Ejecutar backend:

```bash
npm run dev
```

Backend local:

```txt
http://localhost:5001
```

---

### 3. Frontend

Entrar a la carpeta del frontend:

```bash
cd FloFloReact/floflo
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

Ejecutar frontend:

```bash
npm run dev
```

Frontend local:

```txt
http://localhost:5173
```

---

## 🌐 Deploy

El proyecto está preparado para funcionar en Render.

### Frontend

```txt
https://floflodesktop2.onrender.com
```

### Backend

```txt
https://floflobackend.onrender.com
```

---

## 🔐 Seguridad

FloFlo utiliza autenticación mediante JWT y rutas protegidas.

El backend valida:

* Usuario autenticado.
* Rol del usuario.
* Ownership de recursos.
* Acceso de padres solo a niños asociados.
* Protección de rutas antiguas inseguras.
* Validación de datos antes de crear o modificar registros.

---

## 🧪 Checklist de prueba

### Niño/a

* [ ] Registro
* [ ] Login
* [ ] Registrar emoción
* [ ] Crear rutina
* [ ] Editar rutina
* [ ] Completar rutina
* [ ] Ver historial de rutina
* [ ] Crear lugar
* [ ] Generar pasos con Félix
* [ ] Editar lugar
* [ ] Crear amigo/contacto
* [ ] Crear conversación de amigo
* [ ] Completar conversación
* [ ] Ver logros

### Padre/cuidador

* [ ] Login
* [ ] Ver niños asociados
* [ ] Acceder al Panel Padres
* [ ] Revisar perfil sensorial
* [ ] Ver plan semanal
* [ ] Ver dashboard de evolución
* [ ] Descargar PDF
* [ ] Revisar recomendaciones

---

## 🎨 Diseño

FloFlo utiliza una interfaz visual suave, con colores amigables y componentes pensados para entregar una experiencia clara y acompañada.

Elementos principales:

* Tonos morados y lilas.
* Tarjetas redondeadas.
* Modales personalizados.
* Mensajes positivos.
* Personaje Félix como apoyo visual.
* Diseño simple y accesible.

---

## 📌 Estado actual

FloFlo se encuentra en etapa de MVP avanzado.

Actualmente incluye:

* Autenticación completa.
* Roles niño/padre.
* Módulos principales funcionales.
* Rutinas 2.0.
* Reportes PDF.
* Perfil sensorial.
* Panel de padres.
* Logros y progreso.
* Modales personalizados.
* Deploy en Render.

Pendientes sugeridos:

* Mejorar QA con más usuarios reales.
* Pulir visualmente algunas pantallas antiguas.
* Agregar más pruebas automáticas.
* Mejorar documentación técnica de endpoints.
* Optimizar experiencia mobile.
* Añadir configuración avanzada para cuidadores.

---

## 👩‍💻 Autora

Proyecto desarrollado por Dorian Andrea.

---

## 💜 Propósito

FloFlo nace como una herramienta de apoyo para hacer más comprensible, anticipable y amable el día a día de niños y niñas autistas, entregando estructura, acompañamiento y seguimiento para sus familias o cuidadores.

