# automatizacion-simply

## Análisis de la API de SimpliRoute

La API de SimpliRoute es una API RESTful que permite la gestión completa de operaciones logísticas. La autenticación se realiza a través de un token de API que se debe incluir en la cabecera `Authorization` de cada solicitud.

### Datos Obtenibles

La API proporciona acceso a una amplia gama de datos, entre los que se incluyen:

- **Visitas:** Información detallada de cada punto de entrega o recogida (dirección, fecha, ventanas horarias, carga, estado, etc.).
- **Rutas:** Secuencia de visitas asignadas a un vehículo y conductor.
- **Planes:** Agrupación de rutas y visitas para un día específico.
- **Vehículos:** Datos de la flota (capacidad, ubicaciones, habilidades, etc.).
- **Conductores/Usuarios:** Información de los responsables de las entregas.
- **Clientes:** Datos de los clientes a los que se les realiza la entrega.
- **Datos GPS:** Ubicación en tiempo real de los vehículos.
- **Documentos Financieros:** Facturas, recibos y notas de entrega.
- **Webhooks:** Notificaciones de eventos en tiempo real.

### Reportes Generables

Con los datos disponibles, es posible generar una variedad de reportes para el análisis y seguimiento de las operaciones:

1.  **Reporte de Ruta Diaria:**
    - **Contenido:** Rutas planificadas por conductor, secuencia de visitas, horarios planificados vs. horarios reales.
    - **Fuentes de Datos:** `Visits`, `Routes`, `Plans`, `Users`.

2.  **Reporte de Rendimiento de Vehículos:**
    - **Contenido:** Distancia total recorrida, número de visitas completadas, carga total transportada y consumo de combustible por vehículo.
    - **Fuentes de Datos:** `Vehicles`, `Routes`, `Visits`, `GPS Data`.

3.  **Reporte de Entregas a Tiempo (On-Time Delivery):**
    - **Contenido:** Porcentaje de visitas completadas dentro de la ventana horaria planificada, con posibilidad de agregación por conductor, ruta o cliente.
    - **Fuentes de Datos:** `Visits`, `Routes`.

4.  **Historial de Visitas por Cliente:**
    - **Contenido:** Listado de todas las visitas realizadas a un cliente, incluyendo fechas, artículos entregados y el conductor que realizó la entrega.
    - **Fuentes de Datos:** `Clients`, `Visits`, `Users`.

5.  **Reporte de Prueba de Entrega (Proof of Delivery - POD):**
    - **Contenido:** Incluye imágenes tomadas en el lugar de la entrega, firmas (si se capturan) y notas del conductor.
    - **Fuentes de Datos:** `Visits` (y sus datos de checkout asociados).

6.  **Reporte Financiero:**
    - **Contenido:** Resumen de facturas, recibos y notas de entrega para un período determinado.
    - **Fuentes de Datos:** `Invoices`.

7.  **Reporte de Estado de la Flota en Tiempo Real:**
    - **Contenido:** Vista en mapa con la ubicación actual de todos los vehículos, su estado (en ruta, inactivo, etc.) y la hora estimada de llegada (ETA) a su próxima parada.
    - **Fuentes de Datos:** `GPS Data`, `Routes`, `Vehicles`.
