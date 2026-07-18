# Proceso de "Vibe Coding" y Control de Calidad

Este documento detalla la bitácora de desarrollo interactivo entre el ingeniero y el modelo de IA (Antigravity), recopilando los enfoques metodológicos, técnicas de prompts y el control de calidad aplicado a lo largo de la creación de **SaaS-O-Matic**.

---

## 1. Filosofía de Desarrollo "Vibe Coding"

El "Vibe Coding" no consiste en delegar ciegamente la escritura del código a la máquina, sino en actuar como **director de orquesta** (Tech Lead / Arquitecto):
1. **Fijar las Specs de Antemano**: Definimos claramente las reglas del negocio (los tramos de facturación y las ecuaciones) antes de codificar una sola línea.
2. **Modularización del Trabajo**: Indicamos a la IA las directrices precisas de arquitectura (separar rutas de Express, utilidades algorítmicas y base de datos) para evitar la creación de ficheros enormes e incomprensibles.
3. **Auditoría de Código y Refactor**: Cada fragmento de código generado es analizado minuciosamente buscando casos de esquina (boundary conditions) y errores de tipado.

---

## 2. Bitácora de Prompts e Iteración

### Iteración 1: Estructura del Backend y Validación del NIF/CIF
- **Objetivo**: Crear un validador libre de dependencias externas que cubra DNI, NIE y CIF con las reglas de la Agencia Tributaria Española.
- **Enfoque de Prompt**:
  > "Diseña una clase o módulo TypeScript puro `validation.ts` en `backend/src/utils/` con la función `validateSpanishID(id: string): boolean`. Debe analizar si el input es un DNI, un NIE o un CIF utilizando sus dígitos de control correspondientes de acuerdo a las especificaciones fiscales. Añade explicaciones en comentarios para cada paso matemático."
- **Refinamiento Técnico**: Se detectó inicialmente que el CIF requiere verificar la letra inicial en un rango específico `[A-H, J, K-N, P-Q, R-S, W, U, V]`. Se refinó el validador agregando soporte estricto a las letras de entidades no mercantiles donde el control debe ser obligatoriamente una letra (`KPQRSW`).

### Iteración 2: Lógica de Facturación Gradual (Tiered Pricing)
- **Objetivo**: Programar el motor de cálculo de precios.
- **Enfoque de Prompt**:
  > "Escribe la lógica del cálculo de costes de usuario en `pricing.ts`. Asegura que el cálculo no es una tarifa por volumen simple sino acumulativa (los primeros 10 a 10€, de 11 a 50 a 8€ y los siguientes a 5€). Devuelve un desglose detallado con el coste base, el porcentaje de IVA aplicado según el país, el monto total del IVA y el coste total en euros."
- **Control de Calidad**: Creamos pruebas unitarias para corroborar que:
  - 10 usuarios = 100 €
  - 15 usuarios = 140 €
  - 60 usuarios = 100 (primer tramo) + 320 (segundo tramo) + 50 (tercer tramo) = 470 €

### Iteración 3: Frontend Responsive y Glassmorphism en CSS Vanilla
- **Objetivo**: Crear una interfaz visual de alta calidad basada en principios estéticos premium sin recurrir a frameworks utilitarios de CSS (como Tailwind).
- **Directrices de Diseño dadas a la IA**:
  > "Diseña el frontend en React utilizando únicamente CSS Vanilla en `index.css`. Queremos un acabado premium: tema oscuro con fondos traslúcidos (glassmorphism: `backdrop-filter: blur(12px)`), bordes sutiles y degradados vivos con acentos de color cian y violeta neón. La tipografía debe usar Inter. Todos los inputs, botones y tarjetas deben tener micro-animaciones en estados hover y focus."

---

## 3. Estrategia de Auditoría y Aseguramiento de Calidad (QA)

Para validar que el código generado cumple los máximos estándares técnicos:
1. **Tipado Estricto**: Configuración de `tsconfig.json` con `strict: true` para mitigar errores en tiempo de ejecución.
2. **Testeo de Límites**: Implementación de unit tests automatizados con `Jest` para comprobar los cálculos del backend.
3. **Manejo de Carga/Error en API Externa**: En el frontend, implementamos un estado de carga y un manejo de errores en caso de fallo al consumir la API de tipos de cambio (`open.er-api.com`), garantizando que la aplicación continúe operativa con un fallback estático de divisas si no hay conexión a internet.
4. **Manejo de Transacciones**: En el backend, las inserciones en la base de datos SQLite se realizan de manera segura para evitar inyecciones SQL usando parámetros preparados en las consultas.
