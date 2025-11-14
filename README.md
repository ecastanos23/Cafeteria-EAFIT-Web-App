# Cafetería EAFIT – Web App  
Aplicación web diseñada para visualizar el menú de la cafetería de la Universidad EAFIT de forma **rápida, moderna y accesible**; realizada como requisito del proyecto final del curso de Estructuras de Datos y Algoritmos por Wilmer Alberto Gil Moreno; y construida con **Next.js 14**, **TypeScript**, y diseño modular basado en componentes.

---

## Demo en producción  
 **https://cafeteria-eafit.vercel.app/**

---

## Características principales

-  **Interfaz intuitiva y fácil de usar**
-  **Diseño responsive** para uso en móviles y escritorio
-  **Renderizado con App Router (Next.js 14)**
-  Visualización del menú de la cafetería  
-  **Estilos modernos** 
-  Arquitectura modular con **componentes reutilizables**
-  Optimizado para despliegue en Vercel

---

## Tecnologías utilizadas

| Tecnología | Uso |
|-----------|------|
| **Next.js 14** | Framework principal |
| **React** | Construcción de UI |
| **TypeScript** | Tipado robusto |
| **Node.js** | Entorno de ejecución |
| **TailwindCSS / CSS Modules** | Estilización (según lo usado en el proyecto) |
| **Vercel** | Hosting y CI/CD |

---

##  Estructura del proyecto
/
- ├── app/ # Rutas principales (Next.js App Router)
- ├── components/ # Componentes UI reutilizables
- ├── hooks/ # Hooks personalizados
- ├── lib/ # Utilidades, helpers y lógica externa
- ├── public/ # Imágenes, íconos y contenido estático
- ├── scripts/ # Scripts adicionales
- ├── styles/ # Archivos globales de estilos
- ├── package.json # Dependencias del proyecto
- ├── next.config.mjs # Configuración de Next.js
- ├── tsconfig.json # Configuración de TypeScript
- └── .gitignore # Archivos ignorados por Git

---

## Cómo ejecutar el proyecto localmente

### **1. Clonar el repositorio**
```bash
git clone https://github.com/ecastanos23/Cafeteria-EAFIT-Web-App.git
```
### **2. Entrar al proyecto**
```bash
cd Cafeteria-EAFIT-Web-App
```
### **3. Instalar dependencias**
Si usas npm:
```bash
npm install
```
Si usas pnpm:
```bash
pnpm install
```
### **4. Ejecutar en modo desarrollo**
Si usas npm:
```bash
npm run dev
```
Si usas pnpm:
```bash
pnpm dev
```
Luego abre:
```bash
http://localhost:3000
```
---
## Despliegue (Deploy)

La aplicación está desplegada usando **Vercel**.
Cada push a **main** genera automáticamente un nuevo deploy.

---
## Deploy con Vercel
Si deseas deploy manual:
```bash
vercel deploy
```
Asegúrate de tener Vercel instalado:
```bash
npm install -g vercel
```

## Autores
Proyecto desarrollado por:
- Samuel Rendón Pabón
- Juan Diego Albanaez
- Miguel Ángel Marín Mejía
- Jerónimo Contreras Sierra
- Emmanuel Castaño Sepúlveda
  
--- 

## Licencia
*Este proyecto es únicamente con fines educativos.*

---


