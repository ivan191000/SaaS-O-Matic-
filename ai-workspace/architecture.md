# Arquitectura de Software y Modelo de Datos (Node + Vue)

Este documento define la estructura de directorios del proyecto, la base de datos (SQLite) y las directrices técnicas para asegurar la escalabilidad, modularidad y legibilidad del código utilizando **Node.js (TypeScript)** y **Vue.js (Vite + Composition API)**.

---

## 1. Estructura de Directorios

El proyecto se divide en dos componentes principales y autónomos: un frontend desarrollado en Vue 3 (Vite) y un backend en Node.js (TypeScript). Adicionalmente, se incluye el espacio de trabajo de la IA `/ai-workspace`.

```
SaaS-O-Matic-/
├── backend/
│   ├── src/
│   │   ├── routes/          # Rutas y controladores de Express
│   │   │   ├── customers.ts
│   │   │   └── simulations.ts
│   │   ├── utils/           # Algoritmos de negocio y validación
│   │   │   ├── validation.ts # Algoritmo DNI/NIF/CIF
│   │   │   └── pricing.ts    # Algoritmo de tarificación gradual
│   │   ├── db.ts            # Configuración de SQLite y migraciones
│   │   └── index.ts         # Punto de entrada de la API Express
│   ├── package.json
│   ├── tsconfig.json
│   └── database.sqlite      # Archivo físico de la base de datos
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes Vue 3 reutilizables (.vue)
│   │   │   ├── CustomerForm.vue
│   │   │   ├── CustomerCard.vue
│   │   │   ├── CustomerDetails.vue
│   │   │   ├── SimulationForm.vue
│   │   │   └── SimulationHistory.vue
│   │   ├── utils/           # Cliente API y peticiones de divisas
│   │   │   ├── api.ts
│   │   │   └── exchange.ts
│   │   ├── App.vue          # Componente principal de la app (Single File Component)
│   │   ├── index.css        # Hoja de estilos global y diseño CSS Vanilla
│   │   └── main.ts          # Punto de entrada de Vue
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── ai-workspace/            # Documentación del proceso de desarrollo con IA
│   ├── specs.md
│   ├── architecture.md
│   └── vibe-coding.md
│
└── README.md                # Instrucciones de ejecución y despliegue rápido
```

---

## 2. Modelo de Base de Datos (SQLite)

Diseñamos una base de datos ligera pero relacional utilizando SQLite. Esto garantiza que no se requieran bases de datos pesadas (como PostgreSQL o MySQL) para ejecutar el proyecto de prueba técnica en local, facilitando la instalación en un solo paso.

### Diagrama de Relaciones
```
  [ customers ] 1 -------- N [ simulations ]
  (id, name,                 (id, customer_id, active_users,
   fiscal_id, email,          storage_gb, api_calls,
   country, plan)             calculated_cost_eur)
```

### Tabla: `customers`
Guarda la información de cada cliente corporativo.
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT): Identificador único interno.
- `name` (TEXT, NOT NULL): Nombre de la empresa.
- `fiscal_id` (TEXT, NOT NULL, UNIQUE): DNI, NIF o CIF.
- `email` (TEXT, NOT NULL): Email de contacto principal.
- `country` (TEXT, NOT NULL): País (utilizado para el cálculo de impuestos e IVA).
- `plan` (TEXT, NOT NULL): Plan suscrito por el cliente.
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP): Fecha de registro.

### Tabla: `simulations`
Guarda el histórico de simulaciones de facturación para cada cliente.
- `id` (INTEGER, PRIMARY KEY AUTOINCREMENT): Identificador único de simulación.
- `customer_id` (INTEGER, NOT NULL): Clave foránea que referencia a `customers(id)` con eliminación en cascada.
- `active_users` (INTEGER, NOT NULL): Cantidad de usuarios activos simulados.
- `storage_gb` (REAL, NOT NULL): Cantidad de almacenamiento (GB) simulado.
- `api_calls` (INTEGER, NOT NULL): Volumen de llamadas a la API estimadas.
- `calculated_cost_eur` (REAL, NOT NULL): Coste final en Euros con IVA incluido.
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP): Fecha en la que se realizó la simulación.

---

## 3. Directrices de Calidad de Código y Arquitectura Limpia (Node + Vue)

Para asegurar un desarrollo escalable que evite el desorden y los archivos monolíticos:

1. **Reactividad de Vue 3 (Composition API)**: Haremos uso de `ref`, `computed` y `watch` para gestionar la interactividad del simulador (slider de usuarios, inputs de volumen y tipos de cambio) de forma limpia y transparente sin recurrir a stores globales complejas si no son necesarias.
2. **Separación de Responsabilidades**: Las funciones auxiliares de negocio (como el cálculo del coste o la validación del CIF) deben implementarse de manera pura en la carpeta `utils/` y testearse de forma aislada.
3. **Validación Temprana**: Las validaciones de formato e integridad se ejecutan tanto en el cliente (para una respuesta instantánea y mejor UX) como en el servidor (para garantizar la integridad de los datos).
4. **CSS Modular y Tipografía Premium**: Se evita el uso de librerías utilitarias como Tailwind. En su lugar, el diseño visual recae en variables CSS personalizadas (`--primary`, `--accent`, `--bg-dark`, etc.), organizadas en un único archivo modular `index.css` de diseño responsivo.
