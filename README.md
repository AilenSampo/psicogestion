# PsicoGestión

Sistema de gestión de turnos para consultorios de psicopedagogía.

> Estado: **prototipo navegable** (single-page HTML/CSS/JS, sin backend ni persistencia). Esta versión es una demo de UI para validación con usuarios reales antes de invertir en lógica de negocio.

## Estructura

- `index.html` — aplicación completa, autocontenida (HTML + CSS + JS embebido).

## Cómo correrlo localmente

No requiere build ni dependencias. Abrir directamente `index.html` en el navegador o servirlo con cualquier servidor estático:

```bash
npx serve .
```

## Despliegue

Publicado en Vercel como sitio estático. Cualquier push a la rama principal redepliega automáticamente si se conecta el repo.

Para deploy manual desde local:

```bash
npx vercel --prod
```

## Funcionalidades de la demo

- Dashboard con estadísticas
- Agenda semanal
- Turnos del día
- Pacientes y fichas
- Informes
- Cobros
- Configuración (perfil, consultorio, recordatorios, plan)

## Próximos pasos sugeridos (post-test)

- [ ] Persistencia de datos (LocalStorage / Supabase / Firebase)
- [ ] Autenticación de profesional
- [ ] Recordatorios reales por WhatsApp / Email
- [ ] Multi-profesional
- [ ] Exportación de informes a PDF
