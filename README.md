# SaaS-O-Matic (Dynamic Billing & Subscription Optimizer)

Este repositorio contiene la planificación, especificaciones y diseño de arquitectura para **SaaS-O-Matic**, una herramienta interna diseñada para que los equipos comerciales simulen, optimicen y presupuesten suscripciones SaaS multi-divisa para clientes corporativos.

Toda la documentación técnica y metodológica generada durante el proceso de **Spec-Driven Development** y **Vibe Coding** con modelos de IA se encuentra estructurada en la carpeta `/ai-workspace`.

---

## 📂 Estructura del Proyecto de Documentación (Node + Vue)

Los entregables obligatorios requeridos para la evaluación de la prueba técnica están organizados de la siguiente manera:

* **[Planificación y Especificaciones (specs.md)](file:///c:/Users/Usuario/Desktop/SaaS-O-Matic/SaaS-O-Matic-/ai-workspace/specs.md)**:
  * Detalle y formulación matemática del algoritmo de **Facturación por Tramos Acumulativos** (Tiered Pricing).
  * Mapeo de impuestos/IVA por países (España, Francia, Alemania, Reino Unido, etc.).
  * Algoritmo detallado para la validación estricta de Identificadores Fiscales Españoles (DNI, NIE, CIF).
  * Definición de contratos de la API REST (formatos JSON de request/response y códigos de estado HTTP).

* **[Definición de la Arquitectura (architecture.md)](file:///c:/Users/Usuario/Desktop/SaaS-O-Matic/SaaS-O-Matic-/ai-workspace/architecture.md)**:
  * Estructura de carpetas modular propuesta para el frontend (**Vue 3 / Vite**) y backend (Node.js/TypeScript).
  * Modelo lógico y esquema relacional de la base de datos (SQLite).
  * Directrices técnicas aplicadas para asegurar la calidad de código, modularidad y legibilidad utilizando la Composition API de Vue.

* **[Proceso de Vibe Coding y Control de Calidad (vibe-coding.md)](file:///c:/Users/Usuario/Desktop/SaaS-O-Matic/SaaS-O-Matic-/ai-workspace/vibe-coding.md)**:
  * Bitácora del desarrollo iterativo colaborativo.
  * Términos de prompts estructurados utilizados para guiar al modelo de lenguaje en la creación de componentes Vue reactivos y validadores.
  * Estrategia de testing de límites (boundary conditions) y mitigación de fallos de integración.

---

## 🚀 Guía de Despliegue y Ejecución Local

A continuación se detallan las instrucciones paso a paso para levantar los servicios del backend y frontend en un entorno local de desarrollo.

### Requisitos Previos
* **Node.js** (versión 18 o superior recomendada)
* **npm** o **yarn**

---

### 1. Servidor Backend (API REST & Base de Datos)

El backend utiliza **Node.js**, **Express**, **TypeScript** y **SQLite** (mediante el driver `sqlite3` y la librería `sqlite` para soporte asíncrono con async/await).

1. Navegar al directorio del backend:
   ```bash
   cd backend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Ejecutar las migraciones e iniciar el servidor de desarrollo (con autoreload):
   ```bash
   npm run dev
   ```
   * *El servidor se levantará por defecto en `http://localhost:4000`.*
   * *Al iniciar, el backend comprobará la existencia del archivo de base de datos `database.sqlite`. Si no existe, lo creará automáticamente, ejecutará las migraciones y sembrará (seed) datos de prueba iniciales.*

4. Ejecutar las pruebas unitarias (de lógica de cálculo de precios y validación de CIF):
   ```bash
   npm run test
   ```

---

### 2. Cliente Frontend (Dashboard Comercial en Vue 3)

El frontend consiste en una Single Page Application (SPA) construida con **Vue 3**, **Vite** y **TypeScript**, estilizada puramente con **CSS Vanilla** para garantizar un diseño visual premium y responsivo ( glassmorphism, temas oscuros y acentos de color neón).

1. Navegar al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instalar las dependencias de Vue y Vite:
   ```bash
   npm install
   ```
3. Iniciar el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
   * *El cliente estará disponible en la dirección que indique la terminal (usualmente `http://localhost:5173`).*

4. Integración de Divisas en Tiempo Real:
   * La aplicación consume dinámicamente la API pública de tipos de cambio de `https://open.er-api.com/v6/latest/EUR`. En caso de que no haya conexión a Internet, la app tiene configurados fallbacks de tipo estático para evitar bloqueos visuales al usuario comercial.