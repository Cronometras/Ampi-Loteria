# Ampi Lotería

Aplicación web moderna para la gestión inteligente de números de lotería.

## Características

- 🎯 **Gestión de Listas**: Crea y organiza múltiples listas de números de lotería
- 🔍 **Búsqueda Inteligente**: Busca números por terminación con sugerencias automáticas
- 📱 **Diseño Responsivo**: Interfaz optimizada para móviles y escritorio
- 🔐 **Autenticación Segura**: Sistema de login con Firebase Authentication
- ☁️ **Almacenamiento en la Nube**: Datos sincronizados con Firestore
- 🎨 **UI Moderna**: Diseño elegante con Tailwind CSS y componentes Radix UI

## Funcionalidades Principales

### Gestión de Números
- Agregar números con nombre y descripción opcional
- Visualización prominente de números en tarjetas
- Eliminación rápida de números
- Búsqueda por terminación (ej: buscar "24" encuentra números que terminan en 24)

### Búsqueda Inteligente
- Búsqueda por terminación exacta
- Sugerencias automáticas de terminaciones similares cuando no hay coincidencias exactas
- Algoritmo que considera proximidad numérica y patrones de dígitos

### Navegación Dinámica
- Menú lateral que muestra todas las listas creadas
- Truncado automático de nombres largos
- Navegación móvil optimizada

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Instalación y Desarrollo

1. Clona el repositorio:
```bash
git clone https://github.com/Cronometras/Ampi-Loteria.git
cd Ampi-Loteria
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura Firebase:
   - Crea un proyecto en Firebase Console
   - Configura Authentication y Firestore
   - Crea un archivo `.env` con tus credenciales de Firebase

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Construye para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes base de UI
│   ├── lottery/        # Componentes específicos de lotería
│   └── dashboard/      # Componentes del dashboard
├── contexts/           # Contextos de React
├── hooks/              # Hooks personalizados
├── lib/                # Utilidades y configuración
├── pages/              # Páginas principales
└── main.tsx           # Punto de entrada
```

## Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
