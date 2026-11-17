# Cómo publicar Mundialistas en internet

Son 3 partes. Lleva unos 20 minutos la primera vez y es todo gratis.

1. **Supabase**: guarda las cuentas y el equipo de cada jugador.
2. **El archivo `js/config.js`**: le dice al juego cuál es tu Supabase.
3. **GitHub Pages**: publica la página para que cualquiera la abra.

---

## 1. Supabase (cuentas y guardado)

1. Entrá a <https://supabase.com>, tocá **Start your project** y creá una cuenta. Podés usar tu cuenta de GitHub.
2. Tocá **New project**:
   - **Name:** `mundialistas`
   - **Database Password:** inventá una y guardala. El juego no la usa, pero Supabase la pide.
   - **Region:** la más cercana, por ejemplo *South America (São Paulo)*.
   - Tocá **Create new project** y esperá 1 o 2 minutos.
3. **Crear la tabla:** en el menú de la izquierda andá a **SQL Editor** y tocá **New query**. Abrí el archivo `supabase/tablas.sql` de esta carpeta, copiá todo, pegalo y tocá **Run**. Tiene que decir *Success*.
4. **Que no pida mail.** El juego usa usuario y contraseña, sin mail.
   - Andá a **Authentication → Sign In / Providers** (en algunas versiones es **Authentication → Providers → Email**).
   - Dejá **Email** activado y **desactivá "Confirm email"**.
   - Tocá **Save**.
5. **Copiá tus datos:** andá a **Project Settings → API** (o **Data API / API Keys**) y copiá estas dos cosas:
   - **Project URL**, algo como `https://abcdefgh.supabase.co`
   - **anon public key**, un texto largo que empieza con `eyJ...` (o `sb_publishable_...`)

> La "anon key" se puede mostrar en la página sin problema. Las reglas que creó el archivo SQL hacen que cada persona sólo pueda ver y cambiar **su** equipo. **Nunca** pongas la clave que dice `service_role` o `secret`.

## 2. Completar `js/config.js`

Abrí `js/config.js` con el Bloc de notas (o cualquier editor) y pegá tus dos datos entre las comillas:

```js
window.MUNDIALISTAS_CONFIG = {
  supabaseUrl: 'https://abcdefgh.supabase.co',
  supabaseKey: 'eyJhbGciOi...todo-el-texto-largo...',
};
```

Guardá el archivo.

## 3. Publicar con GitHub Pages

### Con GitHub Desktop (lo más fácil)

1. Abrí **GitHub Desktop** y andá a **File → Add local repository**. Elegí la carpeta `juego juanma`.
   - Si dice que no es un repositorio, tocá **create a repository** y después **Create repository**.
2. Escribí un mensaje abajo a la izquierda (por ejemplo `Primera versión`) y tocá **Commit to main**.
3. Tocá **Publish repository**:
   - **Name:** `mundialistas`
   - **Destildá "Keep this code private".** GitHub Pages gratis necesita que el repositorio sea público.
   - Tocá **Publish repository**.
4. En la página de GitHub del repositorio (**Repository → View on GitHub**), andá a **Settings → Pages**:
   - **Source:** *Deploy from a branch*
   - **Branch:** `main` y carpeta `/ (root)`
   - Tocá **Save**.
5. Esperá 1 o 2 minutos y recargá esa página. Arriba aparece la dirección del juego, algo como **`https://tu-usuario.github.io/mundialistas/`**.

### Sin GitHub Desktop

En <https://github.com/new> creá un repositorio **público** llamado `mundialistas`. Después tocá **uploading an existing file** y arrastrá **todo el contenido** de la carpeta: `index.html`, `.nojekyll` y las carpetas `css`, `js` y `supabase`. Tocá **Commit changes** y seguí desde el paso 4 de arriba.

---

## Para jugar

- Mandale la dirección a tus amigos. Cada uno toca **Crear cuenta**, elige un usuario y una contraseña, y arma su equipo.
- El equipo se guarda solo en internet. Se puede seguir jugando desde otra compu o desde el celular entrando con el mismo usuario.
- **Jugar con amigos:** los dos entran con su cuenta, uno toca **👥 Jugar con amigos → Crear sala** y el otro entra a esa sala.
- ⚠️ **Anotá la contraseña.** Como no se usa mail, no hay forma de recuperarla.

## Cuando cambies algo del juego

Abrí GitHub Desktop, escribí un mensaje, tocá **Commit to main** y después **Push origin**. En 1 o 2 minutos la página se actualiza.

## Si algo no anda

- **"Falta un paso en Supabase: desactivar Confirm email"**: falta el paso 1.4.
- **No aparece la pantalla para entrar con usuario**: revisá que `js/config.js` tenga los dos datos bien pegados, entre comillas y con la coma al final.
- **"No se pudo guardar en internet"**: revisá que hayas corrido el archivo `supabase/tablas.sql` (paso 1.3).
- **Proyecto pausado**: en el plan gratis, Supabase pausa el proyecto si nadie lo usa durante una semana. Entrá a supabase.com y tocá **Restore project**. Los equipos guardados no se pierden.
