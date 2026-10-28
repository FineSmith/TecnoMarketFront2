"use strict";
const API_URL = "https://tecnomarket-vy27.onrender.com/api/productos";
const form = document.getElementById("formProducto");
const tabla = document.getElementById("tablaProductos");
const mensaje = document.getElementById("mensaje");
const buscar = document.getElementById("buscar");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const estadoCarga = document.getElementById("estadoCarga");
const contador = document.getElementById("contador");
const tituloFormulario = document.getElementById("tituloFormulario");
if (!form || !tabla || !mensaje || !buscar || !btnGuardar || !btnCancelar || !estadoCarga || !contador || !tituloFormulario) {
    throw new Error("Faltan elementos del DOM. Revisa los ids del formulario en public/index.html.");
}
let productos = [];
let idEdicion = null;
function mostrarMensaje(texto, tipo = "ok") {
    mensaje.textContent = texto;
    mensaje.classList.remove("ok", "error");
    mensaje.classList.add(tipo);
}
function limpiarMensaje() {
    mensaje.textContent = "";
    mensaje.classList.remove("ok", "error");
}
async function solicitar(url, opciones = {}) {
    try {
        const respuesta = await fetch(url, {
            ...opciones,
            headers: {
                ...(opciones.body ? { "Content-Type": "application/json" } : {}),
                ...(opciones.headers || {})
            }
        });
        if (!respuesta.ok) {
            const texto = await respuesta.text().catch(() => "");
            throw new Error(`Error HTTP ${respuesta.status}${texto ? `: ${texto}` : ""}`);
        }
        if (respuesta.status === 204)
            return null;
        const texto = await respuesta.text();
        return texto ? JSON.parse(texto) : null;
    }
    catch (error) {
        if (error instanceof Error && error.message.startsWith("Error HTTP")) {
            throw error;
        }
        throw new Error("No se pudo conectar con la API. Verifica la URL, que Render esté activo y la configuración de CORS.");
    }
}
// GET: Consultar todos los productos
async function cargarProductos() {
    estadoCarga.textContent = "Consultando API...";
    try {
        const datos = await solicitar(API_URL);
        productos = Array.isArray(datos) ? datos : [];
        renderizarTabla();
        estadoCarga.textContent = "Datos obtenidos desde la API.";
        return true;
    }
    catch (error) {
        estadoCarga.textContent = error.message;
        tabla.innerHTML = '<tr><td colspan="12">No se pudo cargar el inventario.</td></tr>';
        contador.textContent = "";
        mostrarMensaje(error.message, "error");
        return false;
    }
}
function crearCelda(texto) {
    const td = document.createElement("td");
    td.textContent = String(texto ?? "");
    return td;
}
function renderizarTabla() {
    const termino = buscar.value.trim().toLowerCase();
    const filtrados = productos.filter(p => (p.nombre || "").toLowerCase().includes(termino) ||
        (p.codigo || "").toLowerCase().includes(termino) ||
        (p.marca || "").toLowerCase().includes(termino));
    tabla.replaceChildren();
    if (filtrados.length === 0) {
        const fila = document.createElement("tr");
        const celda = crearCelda("No se encontraron productos.");
        celda.colSpan = 12;
        fila.appendChild(celda);
        tabla.appendChild(fila);
    }
    for (const p of filtrados) {
        const fila = document.createElement("tr");
        fila.appendChild(crearCelda(p.id));
        const tdImagen = document.createElement("td");
        if (p.imagen) {
            try {
                const url = new URL(p.imagen);
                if (url.protocol === "https:" || url.protocol === "http:") {
                    const img = document.createElement("img");
                    img.className = "product-img";
                    img.src = url.href;
                    img.alt = p.nombre || "Producto";
                    img.loading = "lazy";
                    img.onerror = () => img.remove();
                    tdImagen.appendChild(img);
                }
            }
            catch { }
        }
        fila.appendChild(tdImagen);
        fila.appendChild(crearCelda(p.codigo));
        fila.appendChild(crearCelda(p.nombre));
        fila.appendChild(crearCelda(p.categoria));
        fila.appendChild(crearCelda(p.marca));
        fila.appendChild(crearCelda(p.modelo));
        fila.appendChild(crearCelda(p.garantia));
        fila.appendChild(crearCelda(`S/ ${Number(p.precio).toFixed(2)}`));
        fila.appendChild(crearCelda(p.stock));
        fila.appendChild(crearCelda(`${p.descuento ?? 0}%`));
        const acciones = document.createElement("td");
        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "small";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarProducto(p.id));
        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "small danger";
        eliminar.style.marginLeft = "6px";
        eliminar.textContent = "Eliminar";
        eliminar.addEventListener("click", () => eliminarProducto(p.id));
        acciones.append(editar, eliminar);
        fila.appendChild(acciones);
        tabla.appendChild(fila);
    }
    contador.textContent = `${filtrados.length} de ${productos.length} productos`;
}
// Usa el producto ya cargado; la API no expone GET /api/productos/{id}.
async function editarProducto(id) {
    limpiarMensaje();
    const p = productos.find(producto => producto.id === id);
    if (!p) {
        mostrarMensaje("No se encontró el producto en la lista. Actualiza el inventario e inténtalo de nuevo.", "error");
        return;
    }
    const campos = [
        "Codigo", "Nombre", "Categoria", "Marca", "Modelo",
        "Garantia", "Precio", "Stock", "Descuento", "Imagen", "Descripcion"
    ];
    for (const campo of campos) {
        const prop = campo.charAt(0).toLowerCase() + campo.slice(1);
        const elemento = form.elements.namedItem(campo);
        if (elemento) {
            elemento.value = String(p[prop] ?? "");
        }
    }
    idEdicion = id;
    tituloFormulario.textContent = `Editar producto #${id}`;
    btnGuardar.textContent = "Guardar cambios";
    btnCancelar.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}
// POST para registrar; PUT para actualizar
form.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    limpiarMensaje();
    const formData = new FormData(form);
    const datos = {};
    formData.forEach((valor, clave) => {
        datos[clave] = valor;
    });
    for (const campo of ["Precio", "Stock", "Descuento"]) {
        const valor = Number(datos[campo]);
        datos[campo] = Number.isFinite(valor) ? valor : 0;
    }
    if (!String(datos.Codigo || "").trim() || !String(datos.Nombre || "").trim()) {
        mostrarMensaje("Completa el código y el nombre.", "error");
        return;
    }
    const precio = Number(datos.Precio);
    const stock = Number(datos.Stock);
    const descuento = Number(datos.Descuento);
    if (!Number.isFinite(precio) || precio < 0 ||
        !Number.isFinite(stock) || stock < 0 ||
        !Number.isInteger(stock) ||
        !Number.isFinite(descuento) || descuento < 0 ||
        descuento > 100) {
        mostrarMensaje("Revisa el precio, el stock entero y el descuento (0-100).", "error");
        return;
    }
    const editando = idEdicion !== null;
    const url = editando ? `${API_URL}/${idEdicion}` : API_URL;
    btnGuardar.disabled = true;
    try {
        await solicitar(url, {
            method: editando ? "PUT" : "POST",
            body: JSON.stringify(datos)
        });
        form.reset();
        cancelarEdicion();
        const listaActualizada = await cargarProductos();
        mostrarMensaje(listaActualizada
            ? (editando
                ? "Producto actualizado correctamente."
                : "Producto registrado correctamente.")
            : "El cambio se guardó, pero no se pudo actualizar la lista. Usa «Actualizar lista» para volver a intentarlo.", listaActualizada ? "ok" : "error");
    }
    catch (error) {
        mostrarMensaje(error.message, "error");
    }
    finally {
        btnGuardar.disabled = false;
    }
});
// DELETE: Eliminar un producto
async function eliminarProducto(id) {
    const p = productos.find(x => x.id === id);
    if (!confirm(`¿Deseas eliminar "${p?.nombre || "este producto"}" (ID ${id})?`))
        return;
    limpiarMensaje();
    try {
        await solicitar(`${API_URL}/${id}`, { method: "DELETE" });
        const listaActualizada = await cargarProductos();
        mostrarMensaje(listaActualizada
            ? "Producto eliminado correctamente."
            : "El producto se eliminó, pero no se pudo actualizar la lista. Usa «Actualizar lista» para volver a intentarlo.", listaActualizada ? "ok" : "error");
    }
    catch (error) {
        mostrarMensaje(error.message, "error");
    }
}
function cancelarEdicion() {
    idEdicion = null;
    form.reset();
    tituloFormulario.textContent = "Registrar nuevo producto";
    btnGuardar.textContent = "Registrar producto";
    btnCancelar.hidden = true;
}
btnCancelar.addEventListener("click", cancelarEdicion);
form.addEventListener("reset", () => {
    setTimeout(() => {
        if (idEdicion !== null)
            cancelarEdicion();
    }, 0);
});
buscar.addEventListener("input", renderizarTabla);
document.getElementById("btnRecargar")?.addEventListener("click", cargarProductos);
cargarProductos();
//# sourceMappingURL=app.js.map