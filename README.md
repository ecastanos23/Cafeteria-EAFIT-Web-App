# Cafetería EAFIT – Web App  
Aplicación web diseñada para visualizar el menú de la cafetería de la Universidad EAFIT de forma **rápida, moderna y accesible**.  
Construida con **Next.js 14**, **TypeScript**, y diseño modular basado en componentes.

---

## Demo en producción  
 **https://cafeteria-eafit.vercel.app/**

---

## Características principales

-  **Interfaz intuitiva y fácil de usar**
-  **Diseño responsive** para uso en móviles y escritorio
-  **Renderizado con App Router (Next.js 14)**
-  Visualización del menú de la cafetería  
-  **Estilos modernos** usando TailwindCSS (si aplica)  
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
├── app/ # Rutas principales (Next.js App Router)
├── components/ # Componentes UI reutilizables
├── hooks/ # Hooks personalizados
├── lib/ # Utilidades, helpers y lógica externa
├── public/ # Imágenes, íconos y contenido estático
├── scripts/ # Scripts adicionales
├── styles/ # Archivos globales de estilos
├── package.json # Dependencias del proyecto
├── next.config.mjs # Configuración de Next.js
├── tsconfig.json # Configuración de TypeScript
└── .gitignore # Archivos ignorados por Git

---

## Cómo ejecutar el proyecto localmente

### **1. Clonar el repositorio**
```bash
git clone https://github.com/ecastanos23/Cafeter-a-EAFIT-Web-App.git
```
### **2. Instalar dependencias**
```bash
Si usas npm:
npm install
```
```bash
Si usas pnpm:
pnpm install
```
### **3. Ejecutar en modo desarrollo**
```bash
npm run dev
Luego abre:
http://localhost:3000
```

