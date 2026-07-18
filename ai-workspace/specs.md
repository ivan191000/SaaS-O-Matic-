# Especificaciones de Negocio y Contratos de la API (Spec-Driven Development)

Este documento detalla las reglas de negocio, validaciones y contratos de la API REST para el proyecto **SaaS-O-Matic**.

---

## 1. Reglas de Negocio: Algoritmo de Facturación Acumulativa por Tramos (Tiered Pricing)

El cálculo del coste base mensual se realiza de forma **progresiva o gradual** según el número de usuarios activos. A diferencia de las tarifas planas por volumen (donde todos los usuarios pagan la tarifa del tramo alcanzado), el algoritmo de tramos acumulativos divide a los usuarios en categorías y calcula el coste sumando lo correspondiente a cada tramo.

### Tramos Definidos
- **Tramo 1 (0 a 10 usuarios)**: $10\text{ €}$ por usuario.
- **Tramo 2 (11 a 50 usuarios)**: $8\text{ €}$ por usuario.
- **Tramo 3 (Más de 50 usuarios)**: $5\text{ €}$ por usuario.

### Ecuación Matemática del Coste Base (\(C_{base}\))
Dado un número de usuarios \(U\):
- Si \(U \le 10\):
  \[C_{base} = U \times 10\]
- Si \(10 < U \le 50\):
  \[C_{base} = (10 \times 10) + ((U - 10) \times 8) = 100 + (U - 10) \times 8\]
- Si \(U > 50\):
  \[C_{base} = (10 \times 10) + (40 \times 8) + ((U - 50) \times 5) = 420 + (U - 50) \times 5\]

### Impuestos (Tax/IVA) por País
Al coste base calculado se le añade el impuesto correspondiente según el país del cliente corporativo:
- **España (ES)**: 21% de IVA.
- **Francia (FR)**: 20% de IVA.
- **Alemania (DE)**: 19% de IVA.
- **Italia (IT)**: 22% de IVA.
- **Reino Unido (GB)**: 20% de IVA.
- **Otros países / Fuera de Europa**: 0% (o exento).

**Fórmula de Coste Total (\(C_{total}\))**:
\[C_{total} = C_{base} \times (1 + \text{TasaImpuesto})\]

---

## 2. Validación Algorítmica de Identificadores Fiscales Españoles (DNI/NIF/CIF)

Si el país seleccionado al registrar un cliente es **España**, el backend realiza una validación algorítmica obligatoria:

### A. DNI (Documento Nacional de Identidad)
- **Formato**: 8 números y 1 letra (ej. `12345678Z`).
- **Validación**: La letra se calcula dividiendo los números entre 23. El resto de la división se asocia a una letra mediante la cadena de control: `"TRWAGMYFPDXBNJZSQVHLCKE"`.

### B. NIE (Número de Identidad de Extranjero)
- **Formato**: 1 letra inicial (X, Y o Z), 7 números y 1 letra final (ej. `Y1234567Z`).
- **Validación**: Se sustituye la letra inicial por un número:
  - X $\rightarrow$ 0
  - Y $\rightarrow$ 1
  - Z $\rightarrow$ 2
  - Luego se aplica el mismo algoritmo de control que en el DNI utilizando los 8 dígitos resultantes.

### C. CIF (Código de Identificación Fiscal - Empresas)
- **Formato**: 1 letra de tipo de organización, 7 números y 1 carácter de control (número o letra, ej. `B12345678` o `A1234567B`).
- **Validación**:
  1. Sumar los dígitos en posiciones pares: $A = d_2 + d_4 + d_6$.
  2. Para cada dígito en posición impar ($d_1, d_3, d_5, d_7$): multiplicarlo por 2. Sumar las cifras del resultado (ej. $6 \times 2 = 12 \rightarrow 1+2=3$). Sumar estos valores: $B$.
  3. Suma total: $C = A + B$.
  4. Obtener la cifra de unidades de $C$, llamémosla $U$.
  5. Restar de 10: $R = (10 - U) \bmod 10$.
  6. El carácter de control depende de la letra inicial:
     - Si la letra inicial es **NPQRSW** (entidades no mercantiles, corporaciones, etc.): el control debe ser una letra correspondiente a la posición de $R$ en la secuencia `'JABCDEFGHI'`.
     - Si la letra inicial es **ABEH** (sociedades anónimas, limitadas, etc.): el control debe ser un número igual a $R$.
     - Para otras letras: puede ser indistintamente el número $R$ o la letra correspondiente.

---

## 3. Contratos de la API REST

### `POST /api/customers`
Registra un nuevo cliente corporativo en el sistema.

- **Request Body (JSON)**:
```json
{
  "name": "Nombre de la Empresa S.L.",
  "fiscalId": "B12345678",
  "email": "contacto@empresa.es",
  "country": "España",
  "plan": "Premium"
}
```

- **Response (201 Created)**:
```json
{
  "id": 1,
  "name": "Nombre de la Empresa S.L.",
  "fiscalId": "B12345678",
  "email": "contacto@empresa.es",
  "country": "España",
  "plan": "Premium",
  "createdAt": "2026-07-18T18:14:00.000Z"
}
```

- **Response (400 Bad Request)**:
```json
{
  "error": "El identificador fiscal (CIF) español no es válido."
}
```

### `GET /api/customers`
Retorna todos los clientes registrados, opcionalmente filtrados por nombre o identificador fiscal.

- **Query Params**:
  - `search` (opcional): texto de búsqueda.

- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Nombre de la Empresa S.L.",
    "fiscalId": "B12345678",
    "email": "contacto@empresa.es",
    "country": "España",
    "plan": "Premium",
    "createdAt": "2026-07-18T18:14:00.000Z"
  }
]
```

### `POST /api/simulations`
Registra una nueva simulación de consumo y guarda el coste calculado en euros.

- **Request Body (JSON)**:
```json
{
  "customerId": 1,
  "activeUsers": 15,
  "storageGb": 250.5,
  "apiCalls": 50000
}
```

- **Response (201 Created)**:
```json
{
  "id": 10,
  "customerId": 1,
  "activeUsers": 15,
  "storageGb": 250.5,
  "apiCalls": 50000,
  "calculatedCostEur": 169.4,
  "breakdown": {
    "baseCost": 140.0,
    "vatRate": 0.21,
    "vatAmount": 29.4,
    "totalCostEur": 169.4
  },
  "createdAt": "2026-07-18T18:15:00.000Z"
}
```

### `GET /api/customers/:id`
Retorna el detalle completo de un cliente y su historial de simulaciones ordenadas por fecha descendente.

- **Response (200 OK)**:
```json
{
  "id": 1,
  "name": "Nombre de la Empresa S.L.",
  "fiscalId": "B12345678",
  "email": "contacto@empresa.es",
  "country": "España",
  "plan": "Premium",
  "createdAt": "2026-07-18T18:14:00.000Z",
  "simulations": [
    {
      "id": 10,
      "activeUsers": 15,
      "storageGb": 250.5,
      "apiCalls": 50000,
      "calculatedCostEur": 169.4,
      "createdAt": "2026-07-18T18:15:00.000Z"
    }
  ]
}
```
