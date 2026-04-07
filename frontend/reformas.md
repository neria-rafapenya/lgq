#  Sistema de Presupuestos de Reformas (Interpretación del PDF)

## Paso 1: Preguntas básicas

Antes del uso del LLM, el sistema debe recoger inputs estructurados del usuario.

### Inputs clave el LLM pregunatará esta informacion
- Ciudad o provincia 
  - Impacta en precios de mano de obra
  - Determina disponibilidad del servicio

- Tipos de actuación (estarán en una tabla en BBDD pero e lLLM los consultará)

---

## Paso 2: Tipos de actuación, el LLM dará a escoger o preguntará cuál de estos tipos de actuacion necesita. Se indica en algunos casos los posiboles tipos de respuesta. Las respuestas que no se indiquen pueden no ser relevante, así que obtendrán respuesta del LLM de paso.

## 1. Hacer una reforma integral completa

LLM debe preguntar si:
- la vivienda es propia. posibles respuestas: sí/no/no lo sé 
- tipo de vivienda. posibles respuestas: piso, apartamento, chalet, local, adosado, sótano, parking.
- superficie total en m². posibles respuestas numéricas/string dentro de una lógica de espacio
- baños,número de
- cocinas, número de
- habitaciones, número de
- otras estancias, número de y especificación

### 1.1 Cambiar distribución
- número de paredes a quitar
- número de paredes a añadir

### 1.2 Pintar
- qué habitaciones, especificar
- cuántas
- escoger colores y tipos del catálogo N1
- eliminar estucados

### 1.3 Suelos
- cuántas habitaciones y qué habitaciones
- reparar
- cambiar 
    ### 1.3.1 - ¿se debe quitar el suelo actual o actuar encima del mismo?
    ### 1.3.2 - escoger materiales de catálogo N2


### 1.4 Puertas
- número de puertas
- solo pintar 
   ### 1.4.1 catálogo N1
- cambiar 
   ### 1.4.2 catálogo N4

### 1.5 Ventanas
- número de ventanas
- cambiar
   ### 1.5.1 catálogo N6
- crear cerramientos en jardines y terrazas
   ### 1.5.2 catálogo N7

### 1.6 Cambiar sistema eléctrico (no cocina y baño)
- número de habitaciones
- cableado
- cableado y accesorios
   ### 1.6.1 escoger tipos del catálogo N9

### 1.7 Ventilaciones
- rejillas y tomas de aire
   ### 1.7.1 escoger catálogo N9 y N10
- chimeneas y salidas de humos
   ### 1.7.2 escoger catálogo N9 y N10
- falso techo


---

## 2. Cocina

### 2.1 Cambiar muebles
- escoger de catálogo tipos y materiales N25
 
### 2.2 Cambiar fontanería
- cambiar desagües
- cambiar tuberías de agua


### 2.3 Reemplazar encimera
   ### 2.31 escoger de catálogo tipos y materiales N13

### 2.4 Cambiar electrodomésticos
  ### 2.4.1 escoger de catálogo tipos y materiales N14

### 2.5 Cambiar fregadero
   ### 2.5.1 escoger tipos del catálogo N15

### 2.6 Cambiar grifos
   ### 2.6.1 escoger tipos del catálogo N17

### 2.7 Cambiar alicatado
   ### 2.7.1 escoger tipos del catálogo N18

### 2.8 Cambiar ventanas
- número de ventanas
- si son las mismas, se escogerán igualmente una a una
   ### 2.8.1 catálogo N6

### 2.9 Cambiar puertas
- número de puertas
- escoger materiales de catálogo para cada una
   ### 2.9.1 catálogo N4
- cambiar marcos
   ### 2.9.1 catálogo N4

### 2.10 Cambiar sistema eléctrico
- cableado
- cableado y accesorios
   ### 2.10.1 escoger tipos del catálogo N9



### 2.11 Suelos

- cuántas habitaciones y qué habitaciones
- reparar
- cambiar 
    ### 2.11.1 - ¿se debe quitar el suelo actual o actuar encima del mismo?
    ### 2.11.2 - escoger materiales de catálogo N2

---

## 3. Baño

### 3.1 Cambiar muebles
- escoger de catálogo tipos y materiales N25
 
### 3.2 Cambiar fontanería
- cambiar desagües
- cambiar tuberías de agua

### 3.3 Cambiar accesorios
- escoger tipos del catálogo N24

### 3.4 Cambiar sanitarios
- escoger tipos del catálogo N23

### 3.5 Cambiar grifos
- escoger tipos del catálogo N17

### 3.6 Cambiar alicatado
- escoger tipos del catálogo N18

### 3.7 Cambiar ventanas
- número de ventanas
- si son las mismas, se escogerán igualmente una a una
- catálogo N6

### 3.8 Cambiar puertas
- número de puertas
- escoger materiales de catálogo para cada una
- catálogo N4
- cambiar marcos
     - marcos en catálogo N4

### 3.9 Bañera a ducha, o viceversa.

### 3.10 Montar tabiques

### 3.11 Cambiar sistema eléctrico
- cableado
- cableado y accesorios
- escoger tipos del catálogo N9

### 3.12 Suelos

- cuántas habitaciones y qué habitaciones
- reparar
- cambiar 
    ### 3.12.1 - ¿se debe quitar el suelo actual o actuar encima del mismo?
    ### 3.12.2 - escoger materiales de catálogo N2


---

## 4. Redistribuir espacios

  ### 4.1 Tirar tabiques
  ### 4.2 Pared maestra
  ### 4.3 Crear tabiques
---

## 5. Pintar

### 5.1 Paredes
- m²

### 5.2 Techos
- m²

### 5.3 Suelos (parking)
- m²

### 5.4 Escoger de catálogo N1
- color
- tipo de pintado (pátina, estucado, etc.)

### 5.5 Eliminar estucados

---

## 6. Renovar instalaciones

> no baño, ni cocina, o bien baño y cocina incluido

### 6.1 Cambiar sistema eléctrico
- cableado
- cableado y accesorios
- escoger tipos del catálogo N9

### 6.2 Cambiar fontanería
- cambiar desagües
- cambiar tuberías de agua
- escoger sanitarios del catálogo N23
- escoger accesorios de año del catálogo N24


---

## 7. Climatización

### 7.1 Suelo térmico

### 7.2 Aire acondicionado

### 7.3 Calefacción

---

## Catálogos (estructura clave del sistema)

### N1 - Pinturas
- Colores (pantone)
- Tipos: 
    - Liso (rodillo)
    - Pátina
    - Estucado
    - Esponjado
    - Veladuras
    - Efecto arena
    - Efecto cemento
    - Efecto óxido
    - Efecto mármol
    - Microcemento decorativo
    - Pintura a pistola (airless)
    - Grafiado
    - Gotelé (existente)
    - Eliminación de gotelé
    - Encalado
    - Pintura decorativa con plantilla (stencil)
- Acabados: 
    - Mate
    - Satinado
    - Brillo
    - Acrílico
    - Plástico
    - Lavable
    - Antimoho
    - Antihumedad
    - Antimanchas
    - Ignífugo
    - Ecológico / sin COV
    - Impermeabilizante
    - Transpirable
    - Resistente al roce
    - Alta cubrición
    - Secado rápido

### N2 - Suelos

  #### N2.1 Materiales
  - Mármol
  - Granito
  - Gres
  - Gres porcelánico
  - Terrazo
  - Parquet (madera natural)
  - Parquet multicapa
  - Laminado
  - Vinílico (PVC / SPC)
  - Linóleo
  - Microcemento
  - Hormigón pulido
  - Piedra natural (pizarra, caliza)
  - Cerámica
  - Resina epoxi
  - Caucho
  - Moqueta

  ---

  #### N2.2 Tipos de aplicación
  - Baldosa
  - Mosaico
  - Lama (longitudinal)
  - Espiga (herringbone)
  - Punta Hungría
  - Encolado
  - Flotante
  - Click (sistema rápido)
  - Continuo (sin juntas)
  - Autonivelante
  - Sobre suelo existente
  - Con retirada previa
  - Elevado (suelo técnico)
  - Exterior (antideslizante)
  - Interior

  ---

  #### N2.3 Acabados
  - Mate
  - Satinado
  - Brillo
  - Pulido
  - Apomazado
  - Natural
  - Antideslizante (C1, C2, C3)
  - Texturizado
  - Envejecido
  - Rústico
  - Cepillado
  - Hidrófugo
  - Resistente a manchas
  - Resistente al desgaste (alto tránsito)
  - Impermeable
  - Térmico (compatible con suelo radiante)

  ---

  #### N2.4 Formatos / dimensiones
  - Pequeño formato (≤30x30)
  - Medio formato (30x30 – 60x60)
  - Gran formato (>60x60)
  - Rectangular
  - Cuadrado
  - Lamas (tipo parquet)
  - XXL (120x120, 120x60, etc.)
  - Formato irregular

  ---

  #### N2.5 Colores / estilos
  - Blanco
  - Gris
  - Negro
  - Beige / arena
  - Madera clara
  - Madera oscura
  - Cemento
  - Piedra
  - Mármol veteado
  - Industrial
  - Rústico
  - Moderno
  - Nórdico
  - Hidráulico (baldosa decorativa)

### N4 - Puertas

#### N4.1 Materiales
- Madera maciza
- Madera laminada
- MDF / DM lacado
- Aglomerado
- Aluminio
- PVC
- Cristal (templado / laminado)
- Mixtas (madera + cristal)
- Acero
- Blindadas (estructura metálica + madera)
- Acorazadas
- Melamina

---

#### N4.2 Tipos
- Abatible (convencional)
- Corredera empotrada
- Corredera exterior (tipo granero)
- Plegable
- Pivotante
- Vaivén
- Blindada
- Acorazada
- Cortafuegos
- Exterior (entrada)
- Interior
- Técnica (instalaciones, registros)

---

#### N4.3 Acabados
- Lacado (blanco, color)
- Barnizado
- Natural
- Mate
- Satinado
- Brillo
- Texturizado
- Imitación madera
- Envejecido
- Rústico
- Hidrófugo
- Ignífugo

---

#### N4.4 Componentes / extras
- Marco
- Premarco
- Tapetas
- Herrajes (bisagras, guías)
- Tiradores / manillas
- Cerradura estándar
- Cerradura de seguridad
- Mirilla
- Burletes (aislamiento)
- Cierre magnético

---

#### N4.5 Dimensiones / formato
- Estándar (alto/ancho común)
- A medida
- Doble hoja
- Puerta simple
- Altura especial (techo alto)

---

#### N4.6 Estilos
- Moderno
- Clásico
- Minimalista
- Rústico
- Industrial
- Nórdico
- Invisible (enrasada)
- Vidriada / con cuarterones

### N6 - Ventanas

#### N6.1 Materiales
- PVC
- Aluminio
- Madera
- Mixtas (aluminio + madera)
- Acero
- Fibra de vidrio
- Cristal (estructura ligera)
- Rotura de puente térmico (RPT)

---

#### N6.2 Tipos
- Corredera
- Abatible (oscilante)
- Oscilobatiente
- Fija
- Pivotante
- Guillotina
- Plegable
- Proyectante
- Galería
- Ventana de tejado (tipo Velux)
- Mirador
- Escaparate

---

#### N6.3 Acristalamiento
- Doble acristalamiento
- Triple acristalamiento
- Cristal templado
- Cristal laminado
- Bajo emisivo (Low-E)
- Control solar
- Cámara de aire
- Cámara con gas argón
- Cámara con gas krypton
- Seguridad (antirrobo)

---

#### N6.4 Acabados
- Blanco
- Colores RAL
- Imitación madera
- Anodizado
- Lacado
- Mate
- Satinado
- Brillo
- Texturizado

---

#### N6.5 Prestaciones
- Aislamiento térmico
- Aislamiento acústico
- Estanqueidad (aire/agua)
- Seguridad (RC2, RC3…)
- Antiviento
- Antihumedad

---

#### N6.6 Componentes / extras
- Marco
- Premarco
- Hoja
- Herrajes
- Manillas
- Persianas integradas
- Cajón de persiana
- Mosquiteras
- Vidrio de seguridad
- Sellados
- Juntas

---

#### N6.7 Dimensiones / formato
- Estándar
- A medida
- Pequeño formato
- Gran formato
- Ventanas panorámicas
- Puerta-ventana

---

#### N6.8 Ubicación / uso
- Interior
- Exterior
- Fachada
- Terraza
- Jardín
- Cubierta / tejado

### N7 - Cerramientos

#### N7.1 Materiales
- Aluminio
- PVC
- Madera
- Acero / hierro
- Cristal (templado / laminado)
- Panel sándwich
- Obra (ladrillo / bloque)
- Hormigón
- Malla metálica
- Composite
- Metacrilato
- Policarbonato

---

#### N7.2 Tipos
- Toldo
- Vallado
- Muro
- Cerramiento de terraza
- Cerramiento de balcón
- Cerramiento de jardín
- Pérgola
- Porche cerrado
- Cortina de cristal
- Panel fijo
- Cerramiento desmontable
- Cerramiento corredero
- Cerramiento abatible

---

#### N7.3 Sistemas de apertura
- Fijo
- Corredero
- Abatible
- Plegable
- Enrollable (toldo)
- Motorizado
- Manual

---

#### N7.4 Acabados
- Lacado (RAL)
- Anodizado
- Imitación madera
- Mate
- Brillo
- Satinado
- Texturizado
- Galvanizado (acero)
- Pintado

---

#### N7.5 Prestaciones
- Aislamiento térmico
- Aislamiento acústico
- Resistencia al viento
- Resistencia a la corrosión
- Impermeabilidad
- Protección solar
- Seguridad (antirrobo)
- Durabilidad exterior

---

#### N7.6 Componentes / extras
- Estructura
- Perfiles
- Paneles
- Vidrios
- Anclajes
- Tornillería
- Sellados
- Guías
- Motores (toldos, correderos)
- Sensores (viento, lluvia)
- Persianas integradas
- Mosquiteras

---

#### N7.7 Dimensiones / formato
- A medida
- Módulos estándar
- Lineal (vallado)
- Perimetral
- Altura baja / media / alta
- Gran formato (terrazas completas)

---

#### N7.8 Ubicación / uso
- Terraza
- Jardín
- Balcón
- Fachada
- Interior
- Exterior
- Piscina
- Ático

### N9 - Instalación eléctrica

#### N9.1 Iluminación
- Lámparas de techo
- Plafones
- Downlights (ojos de buey)
- Tiras LED
- Apliques de pared
- Focos empotrados
- Focos de superficie
- Iluminación indirecta
- Iluminación exterior
- Iluminación decorativa
- Iluminación técnica (trabajo)

---

#### N9.2 Enchufes e interruptores
- Enchufes simples
- Enchufes dobles
- Enchufes con USB
- Enchufes inteligentes
- Interruptores simples
- Interruptores dobles
- Conmutadores
- Cruzamientos
- Reguladores (dimmer)
- Temporizadores
- Bases industriales

---

#### N9.3 Detectores y sistemas
- Detectores de humo
- Detectores de gas
- Detectores de movimiento
- Sensores de presencia
- Sensores de luz
- Alarmas
- Videoporteros
- Domótica básica

---

#### N9.4 Cableado e instalación
- Cableado básico
- Cableado reforzado
- Canalización empotrada
- Canalización vista
- Tubería corrugada
- Bandejas portacables
- Instalación completa
- Reforma parcial
- Sustitución de cableado antiguo

---

#### N9.5 Cuadro eléctrico y protección
- Cuadro eléctrico básico
- Cuadro eléctrico completo
- Diferenciales
- Magnetotérmicos
- Protector de sobretensión
- ICP
- Automatización del cuadro
- Ampliación de potencia

---

#### N9.6 Acabados
- Blanco estándar
- Colores RAL
- Negro
- Metálico
- Cristal
- Mate
- Brillo

---

#### N9.7 Prestaciones
- Ahorro energético
- LED bajo consumo
- Alta eficiencia
- Seguridad eléctrica
- Protección contra sobretensiones
- Instalación certificada
- Cumplimiento normativa (REBT)

---

#### N9.8 Ubicación / uso
- Interior
- Exterior
- Cocina
- Baño
- Salón
- Dormitorio
- Garaje
- Jardín

### N10 - Ventilación
- Rejillas
- Chimeneas
- Salidas de humo

### N13 - Encimeras
- Materiales: cuarzo, granito, madera

### N14 - Electrodomésticos

#### N14.1 Categorías
- Horno
- Campana extractora
- Placa (vitrocerámica / inducción / gas)
- Lavavajillas
- Lavadora
- Secadora
- Frigorífico
- Microondas
- Congelador
- Vinoteca
- Detector de humos
- Sistemas domóticos (integrados)

---

#### N14.2 Tipos
- Integrable
- Panelable
- Libre instalación
- Compacto
- Industrial
- De encastre
- Modular

---

#### N14.3 Energía / tecnología
- Eléctrico
- Gas
- Mixto
- Inducción
- Bajo consumo (A, A+, A++)
- Alta eficiencia energética
- Inverter
- Smart / conectado (WiFi)

---

#### N14.4 Acabados
- Blanco
- Negro
- Inox
- Cristal
- Panelado (mismo acabado que muebles)
- Mate
- Brillo

---

#### N14.5 Prestaciones
- Programable
- Autolimpieza (pirolítico)
- Silencioso
- Rápido / turbo
- Seguridad infantil
- Control remoto
- Multifunción
- Sensor automático

---

#### N14.6 Dimensiones / formato
- Estándar
- Compacto
- Gran formato
- Bajo encimera
- Columna

### N15 - Fregaderos

#### N15.1 Tipos
- Bajo encimera
- Sobre encimera
- Integrado
- Encastrado
- Con escurridor
- Sin escurridor
- De un seno
- De dos senos
- Con seno y medio
- Industrial

---

#### N15.2 Materiales
- Acero inoxidable
- Resina
- Silestone / cuarzo
- Cerámica
- Granito
- Composite

---

#### N15.3 Acabados
- Satinado
- Pulido
- Mate
- Texturizado
- Antirayaduras
- Antihuellas

---

#### N15.4 Formatos / dimensiones
- Compacto
- Estándar
- Gran formato
- Rectangular
- Cuadrado
- Redondo

---

#### N15.5 Prestaciones
- Antibacteriano
- Resistente a manchas
- Resistente al calor
- Antiruido
- Fácil limpieza
- Alta durabilidad

---

#### N15.6 Componentes / extras
- Válvula
- Sifón
- Rebosadero
- Cesta / colador
- Tabla de corte integrada
- Accesorios deslizantes

### N17 - Grifería

#### N17.1 Tipos
- Monomando
- Bimando
- Termostático
- Electrónico / sensor
- Extraíble (ducha)
- Caño alto
- Caño bajo
- Empotrado
- Exterior
- De pared
- De encimera

---

#### N17.2 Materiales
- Latón
- Acero inoxidable
- Cromado
- Bronce
- Negro mate
- Oro / acabados especiales

---

#### N17.3 Acabados
- Cromado
- Mate
- Satinado
- Brillo
- Negro
- Blanco
- Dorado
- Imitación acero
- Antihuellas

---

#### N17.4 Prestaciones
- Ahorro de agua
- Aireador
- Limitador de caudal
- Control de temperatura
- Antical
- Antigoteo
- Alta presión
- Fácil instalación

---

#### N17.5 Componentes / extras
- Cartucho cerámico
- Latiguillos
- Soporte de ducha
- Flexo
- Rociador
- Teleducha

---

#### N17.6 Ubicación / uso
- Cocina
- Lavabo
- Ducha
- Bañera
- Exterior

### N18 - Alicatados

#### N18.1 Materiales
- Cerámica
- Gres
- Gres porcelánico
- Mármol
- Piedra natural (pizarra, caliza)
- Vidrio
- Pasta blanca
- Pasta roja
- Azulejo hidráulico
- Resina
- Microcemento

---

#### N18.2 Tipos de aplicación
- Baldosa
- Mosaico
- Rajola
- Gran formato
- Pequeño formato
- Rectangular
- Cuadrado
- Hexagonal
- Espiga
- Combinado (varios formatos)
- Continuo (microcemento)

---

#### N18.3 Acabados
- Mate
- Satinado
- Brillo
- Pulido
- Natural
- Texturizado
- Antideslizante
- Hidrófugo
- Envejecido
- Rústico

---

#### N18.4 Ubicación / uso
- Pared baño
- Pared cocina
- Zona ducha
- Zona fregadero
- Exterior
- Interior

### N23 - Sanitarios

#### N23.1 Tipos
- Inodoro
- Inodoro suspendido
- Bidet
- Lavabo
- Lavabo sobre encimera
- Lavabo encastrado
- Ducha
- Plato de ducha
- Bañera
- Bañera exenta
- Bañera encastrada

---

#### N23.2 Materiales
- Cerámica
- Porcelana
- Resina
- Solid surface
- Acrílico
- Piedra natural
- Composite

---

#### N23.3 Acabados
- Blanco
- Negro
- Mate
- Brillo
- Texturizado
- Colores personalizados

---

#### N23.4 Prestaciones
- Bajo consumo de agua
- Doble descarga
- Antical
- Antibacteriano
- Fácil limpieza
- Antideslizante (ducha)
- Con sistema oculto (cisterna empotrada)

---

#### N23.5 Componentes / extras
- Cisterna
- Bastidor
- Tapa amortiguada
- Desagüe
- Válvulas
- Mampara (relacionado)

### N24 - Accesorios baño

#### N24.1 Tipos
- Toalleros
- Portarrollos
- Escobillero
- Jaboneras
- Dosificadores
- Espejos
- Espejos con luz
- Estanterías
- Ganchos
- Portacepillos
- Cestas
- Accesorios de ducha

---

#### N24.2 Materiales
- Acero inoxidable
- Cromado
- Aluminio
- Plástico
- Cristal
- Madera

---

#### N24.3 Acabados
- Cromado
- Mate
- Brillo
- Negro
- Blanco
- Dorado
- Satinado

---

#### N24.4 Prestaciones
- Antihumedad
- Anticorrosión
- Fácil instalación
- Adhesivo (sin taladro)
- Resistente al agua

### N25 - Muebles de cocina

#### N25.1 Tipos
- Muebles bajos
- Muebles altos
- Columnas
- Muebles esquina
- Isla
- Península
- Muebles modulares
- Muebles a medida

---

#### N25.2 Materiales
- Melamina
- MDF / DM lacado
- Madera maciza
- Aglomerado
- Laminado
- Acero inoxidable
- Vidrio

---

#### N25.3 Acabados
- Lacado
- Mate
- Brillo
- Satinado
- Imitación madera
- Colores RAL
- Texturizado

---

#### N25.4 Configuración
- Lineal
- En L
- En U
- Con isla
- Con península

---

#### N25.5 Componentes / extras
- Cajones
- Puertas
- Bisagras
- Guías
- Tiradores
- Sistemas push (sin tirador)
- Iluminación interior
- Organizadores interiores

---

#### N25.6 Prestaciones
- Resistente a humedad
- Fácil limpieza
- Alta durabilidad
- Soft-close (cierre suave)
- Modularidad
---


## Paso 3: MANO DE OBRA
   ### 🧮 Cálculo de horas (clave del sistema)

### Pasos

1. Desglose de tareas (partidas), listado de posibles:
  # 🧱 Partidas (Desglose de tareas)

    ## 1.1 Demoliciones

    - Demolición de tabiques
    - Demolición de paredes maestras (con refuerzo)
    - Retirada de suelos
    - Retirada de alicatados
    - Retirada de sanitarios
    - Retirada de muebles (cocina/baño)
    - Retirada de carpintería (puertas/ventanas)
    - Retirada de instalaciones eléctricas
    - Retirada de instalaciones de fontanería
    - Carga y transporte de escombros

    ---

    ## 1.2 Albañilería

    - Levantado de tabiques
    - Recrecido de suelos
    - Enfoscado y enlucido
    - Reparación de paredes
    - Formación de pendientes
    - Apertura de huecos en muros
    - Refuerzo estructural
    - Formación de rozas (instalaciones)
    - Tapado de rozas

    ---

    ## 1.3. Suelos

    - Preparación de superficie
    - Nivelado (autonivelante)
    - Colocación de suelo cerámico
    - Colocación de parquet
    - Colocación de suelo laminado
    - Colocación de vinílico
    - Colocación de microcemento
    - Colocación sobre suelo existente
    - Retirada de suelo previo
    - Sellado de juntas
    - Rodapiés (colocación)

    ---

    ## 1.4. Alicatados

    - Preparación de paredes
    - Impermeabilización
    - Colocación de azulejos
    - Colocación de mosaico
    - Colocación de gran formato
    - Rejuntado
    - Sellado
    - Remates y cortes

    ---

    ## 1.5. Pintura

    - Preparación de superficies
    - Lijado
    - Aplicación de imprimación
    - Pintura de paredes
    - Pintura de techos
    - Pintura decorativa
    - Eliminación de gotelé
    - Reparación previa (grietas)

    ---

    ## 1.6. Carpintería (puertas)

    - Instalación de puertas
    - Instalación de puertas correderas
    - Instalación de marcos
    - Instalación de herrajes
    - Ajuste de puertas
    - Pintado de puertas
    - Sustitución de puertas

    ---

    ## 1.7. Carpintería (ventanas)

    - Instalación de ventanas
    - Retirada de ventanas existentes
    - Sellado perimetral
    - Ajuste de carpintería
    - Instalación de persianas
    - Instalación de mosquiteras

    ---

    ## 1.8. Fontanería

    - Instalación de tuberías
    - Sustitución de tuberías
    - Instalación de desagües
    - Instalación de puntos de agua
    - Instalación de sanitarios
    - Instalación de grifería
    - Instalación de fregaderos
    - Pruebas de presión
    - Conexiones a red general

    ---

    ## 1.9. Electricidad

    - Instalación de cableado
    - Sustitución de cableado
    - Instalación de cuadro eléctrico
    - Instalación de puntos eléctricos
    - Instalación de iluminación
    - Instalación de enchufes
    - Instalación de interruptores
    - Instalación de domótica básica
    - Certificación eléctrica

    ---

    ## 1.10. Ventilación

    - Instalación de rejillas
    - Instalación de conductos
    - Instalación de extractores
    - Instalación de chimeneas
    - Instalación de falso techo técnico

    ---

    ## 1.11. Climatización

    - Instalación de aire acondicionado
    - Instalación de calefacción
    - Instalación de radiadores
    - Instalación de suelo radiante
    - Instalación de termostatos

    ---

    ## 1.12. Cocina

    - Montaje de muebles de cocina
    - Instalación de encimera
    - Instalación de electrodomésticos
    - Instalación de fregadero
    - Instalación de grifería cocina
    - Ajuste de muebles
    - Nivelado de módulos

    ---

    ## 1.13. Baño

    - Montaje de muebles de baño
    - Instalación de lavabo
    - Instalación de inodoro
    - Instalación de plato de ducha
    - Instalación de bañera
    - Instalación de mampara
    - Instalación de accesorios
    - Sellado de juntas
    - Impermeabilización zona húmeda

    ---

    ## 1.14. Cerramientos

    - Instalación de cerramientos
    - Instalación de toldos
    - Instalación de pérgolas
    - Instalación de vallados
    - Instalación de estructuras
    - Anclaje de sistemas

    ---

    ## 1.15. Finalización

    - Limpieza final de obra
    - Retirada de residuos
    - Revisión de instalaciones
    - Puesta en marcha
    - Entrega de obra
    
2. Medición (m², ml, unidades)
3. Rendimientos (tiempo por unidad)

---

### Ejemplo

Si:
- 1 m² de pladur = 2 horas
- 50 m²

→ 50 × 2 = 100 horas

---

## 📐 Fórmulas clave

Total Horas = ∑ (Cantidad × Rendimiento) + Imprevistos

Coste MO = Total Horas × Precio/Hora

---




