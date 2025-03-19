# Apoyo Fácil

## Descripción

Apoyo Fácil es una aplicación web que se enfoca en facilitar el acceso a la ayuda y la colaboración en diversas áreas. La aplicación permite a los usuarios registrarse, iniciar sesión, crear campañas de ayuda, recibir beneficios y realizar registros de actividades.

## Posibles Nombres

ApoyoFácil – Enfocado en una ayuda accesible y rápida.
Conexión Solidaria – Refuerza el valor de la solidaridad en la gestión social.
Conexión Transparente – Enfatiza claridad y confianza en la gestión social.
Conexión Abierta – Sugiere accesibilidad y transparencia.
Red Solidaria – Una red de apoyo bien estructurada.
Vínculo Solidario – Refuerza la idea de unión y colaboración.

Transparencia Social – Un nombre que deja claro el compromiso con la claridad.
Acción Solidaria – Refuerza el enfoque en la acción y el compromiso social.

"Tu apoyo, directo a quienes más lo necesitan."
"Conectamos ayuda con quienes más la requieren."
"Asistencia fácil, rápida y transparente."

## Funcionalidades

#Login
Iniciar Sesión.

#Dashboard
Campañas Activas - Beneficios Entregados - Total Beneficiarios.
Tabla Registro de Actividades Personales.

#Campañas
Campañas Activas.
Tabla Datos de Campañas.

#Entregas
Beneficios Entregados.
Tabla Datos de Entregas.

#Beneficiarios
Total Beneficiarios.
Tabla Datos de Beneficiarios.

#Registros
Tabla Datos de Registros Generales.

#Apartado de Reportes
Descargar reportes mensuales, anuales o totales?

#Apartado Gestion de Usuarios.
Crear Usuario, Editar Usuario, Borrar Usuario.

#LOOKA\_

## Comentarios

Unir tabla con Titulo y input de busqueda.

Lista Campañas activas hacia abajo.

Pagination => faltan las flechas de los lados y controlar lo que pasa si se abre una url con un numero de pagina que no existe.

Si ya hay una campaña de por ejemplo, entrega de Vales de Gas, limitar la campaña a 1 hasta que esta termine?

Descargar reporte completo de una campaña?

Error Handlers.

# Pendiente por pedir

¿Límite de 1 tipo campaña activa a la vez? Ej: 1 campaña de vales de gas, 1 campaña de tarjeta de comida, 1 campaña de pañales, etc.
¿Cuales serán los roles de los usuarios?¿Que permisos tiene cada uno?
Es posible eliminar una entrega de beneficio en caso de ser necesario?
Lista de todos los beneficios, cual sería su código de folio correspondiente y cuales son los datos necesarios a registrar?
En caso de ser doble, el código de folio sería "DO".¿Cómo es en caso de que se entreguen más de 2 beneficios a la vez?

¿Necesitan la fecha de la última actualización del rsh de la persona?
¿Cómo se conectan al rsh?¿de donde obtienen el excel con la información?¿Alguna plataforma?
¿Qué atributos tienen asociados cada campaña? (a quienes está dirigida/restriccion nivel socioeconomico, criterios de aceptación, etc.) ¿Necesitan que esta información esté incluida en los datos de la campaña?

¿Que atributos tienen asociados cada entrega de beneficio?¿Además de datos personales, ¿que datos se deben incluir? ej: pertenece a un grupo indígena, discapacidades, nivel socioeconómico, etc.

3?
4?

# Fechas

17/03/2025 - Revición interna de la aplicación.
24/03/2025 - Primera versión de la aplicación.

# TODO

Login // Authorization - Aunthentication
Ingresar Registros de Actividades Personales
Mejorar UI de Campañas Activas
Skeleton Loading

Entregas
RSH

Cómo se estructurará el folio? Código predefinido para cada tipo de campaña? o dropdown con opción a que seleccionen el código o ingresen uno nuevo?

Search bar -> Detalle Campaña (Buscar x folio tambien?)

!Datepicker border-radius !== Input component border-radius

Entregas => Entregas Hoy, Entregas Totales.

Breadcrumbs.

Nombre Campaña Dropdown Input, el texto esta un poco corrido hacia abajo me parece (revisar y arreglar).

Botón "Ver Detalle" en la tabla de Campañas?

Botón "Terminar Campaña", pendiente.
Verificación "Eliminar Campaña", pendiente (preguntar si esta seguro de eliminarla).
Disable botones de cerrar modal una vez que envia el request al server, o al menos que no se haga el redirect si se cierra el modal.
Icono de tabla vacia en caso de que no haya registros?
Case insensitive search.

Estructura DB en Neon.
En Neon, cambiar tramo de boolean a int.

Campañas => Vista Cartas / Vista Tablas. (reference: https://dribbble.com/shots/22281411-New-event-form)
RSH => Detalles, Vista Cartas? / Vista Tablas (Toggle?)

AHORA => RSH (pendiente) dropdown button [Ingresar RSH, Actualizar RSH, Importar RSH]

Fechas ingresadas en RSH corridas.

Limitar tipo de campaña activa. x

Generar id custom (folio entregas). +

Breadcrumbs. +

Barra busqueda, cambiar placeholder de acuerdo a la vista en la que se encuentre el usuario. +

Arreglar layout tablas con grid.

Arreglar pagination (saltos al cambiar de pagina).

Arreglar los toast de crud, solo el de nueva campaña esta bien.

===========================================================

# Campos Formulario Beneficios

Entregas:

- Generar Folio
- Observaciones
- Fecha Entrega (Me parece que no sería automática)
- RUT
- ID Usuario

Entrega:

- ID_entrega
- Detalle (Talla pañal, Monto, etc)
- Folio
- ID_Campaña

Debiese tener un estado de Pendiente, Entregado, etc?
Asi se registra la entrega en la db, luego de ingresada se pueden generar los documentos, y cuando vaya a ingresar los documentos pueda cambiar el estado a Entregado.

Verificar que los campos no esten vacios en Modal Asignar Beneficios.

Limitar cantidad de campañas activas tambien.

HACER TABLA ENTREGAS +

GENERAR DOCUMENTOS PDF / MODAL UPLOAD x

MEJORAR MODAL INGRESO ENTREGAS - opcion de descarga y upload de archivo al ingresar las entregas?

TABLA RSH DETALLE?

REVISAR MODAL INGRESO CAMPAÑA/ACTUALIZAR CAMPAÑA +

MODAL IMPORTAR x

SALTO DE PAGINA x

data/rsh.ts => optimizar busquedas
submit btns

# Extras

Decreto supremo 82

Fonts:
Titan One

# Comentarios

SIBAS - Sistema Integrado de Beneficios y Asistencias Sociales

Limite Cantidades: Tarjetas, etc // Stock?

Boton Nueva Acta => Generar Nueva Acta.
