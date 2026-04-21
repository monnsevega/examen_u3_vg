"use client";

import { useMemo, useState } from "react";
import {
  autenticarUsuario,
  cerrarSesionUsuario,
  configurarPersistencia,
} from "@/firebase/auth";

type AuthUser = {
  email: string;
};

function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export default function LoginExam() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState<AuthUser | null>(null);

  const tituloBoton = useMemo(() => {
    return cargando ? "Entrando..." : "Entrar";
  }, [cargando]);

  async function procesarAcceso(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // limpiar errores previos
    setError("");

    // validar campos vacíos
    if (!correo || !contrasena) {
      setError("Todos los campos son obligatorios");
      return;
    }

    // validar formato de correo
    if (!esCorreoValido(correo)) {
      setError("Formato de correo inválido");
      return;
    }

    try {
      // activar carga
      setCargando(true);

      // configurar persistencia
      await configurarPersistencia(recordarme);

      // autenticar usuario
      const credenciales = await autenticarUsuario(correo, contrasena);

      // guardar usuario
      setUsuario({
        email: credenciales.user.email || "",
      });
    } catch (err) {
      setError("Credenciales incorrectas");
    } finally {
      // limpiar carga
      setCargando(false);
    }
  }

  async function salir() {
    await cerrarSesionUsuario();
    setUsuario(null);
    setCorreo("");
    setContrasena("");
    setError("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-purple-100 px-4">
      <section className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Acceso escolar</h1>
          <p className="text-gray-500 text-sm">
            Completa la funcionalidad de inicio de sesión
          </p>
        </div>

        {!usuario ? (
          <form onSubmit={procesarAcceso} className="space-y-4">
            <div>
              <label htmlFor="correo" className="block text-sm font-medium">
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="alumno@correo.com"
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium">
                Contraseña
              </label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
                placeholder="******"
                className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(event) => setRecordarme(event.target.checked)}
                className="mr-2"
              />
              Recordarme
            </label>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-purple-400 text-white py-2 rounded-md hover:bg-purple-500 disabled:bg-gray-400 transition"
            >
              {tituloBoton}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div>
              <p className="text-purple-600 font-semibold">
                Inicio de sesión CORRECTO
              </p>
              <h2 className="text-xl font-bold">
                ¡Bienvenido, {usuario.email}!
              </h2>
            </div>

            <button
              type="button"
              onClick={salir}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-800"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
