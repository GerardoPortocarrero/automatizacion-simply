# automatizacion-simply

## Análisis de la API de SimpliRoute

La API de SimpliRoute es una API RESTful que permite la gestión completa de operaciones logísticas. La autenticación se realiza a través de un token de API que se debe incluir en la cabecera `Authorization` de cada solicitud.

### Datos Obtenibles

La API proporciona acceso a una amplia gama de datos, entre los que se incluyen:

- **Visitas:** Información detallada de cada punto de entrega o recogida (dirección, fecha, ventanas horarias, carga, estado, etc.).
- **Rutas:** Secuencia de visitas asignadas a un vehículo y conductor.
- **Planes:** Agrupación de rutas y visitas para un día específico.
- **Capacidad Vehículos:** Datos de la flota (capacidad, ubicaciones, habilidades, etc.).
- **Conductores/Usuarios:** Información de los responsables de las entregas.
- **Clientes:** Datos de los clientes a los que se les realiza la entrega.
- **Datos GPS:** Ubicación en tiempo real de los vehículos.
- **Documentos Financieros:** Facturas, recibos y notas de entrega.
- **Webhooks:** Notificaciones de eventos en tiempo real.

### Reportes Generables

Con los datos disponibles, es posible generar una variedad de reportes para el análisis y seguimiento de las operaciones:

1.  **Reporte Ruta:**
    - **Contenido:** Rutas planificadas por conductor, secuencia de visitas, horarios planificados vs. horarios reales.
    - **Fuentes de Datos:** `Visits`, `Routes`, `Plans`, `Users`.

2.  **Capacidad Vehículos:**
    - **Contenido:** Distancia total recorrida, número de visitas completadas, carga total transportada y consumo de combustible por vehículo.
    - **Fuentes de Datos:** `Vehicles`, `Routes`, `Visits`, `GPS Data`.

3.  **Reporte Entregas:**
    - **Contenido:** Porcentaje de visitas completadas dentro de la ventana horaria planificada, con posibilidad de agregación por conductor, ruta o cliente.
    - **Fuentes de Datos:** `Visits`, `Routes`.
