// ==========================================================================
// 1. MODELOS DE DATOS E INTERFACES (Consistentes con la API de TecnoMarket)
// ==========================================================================
interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  imagen?: string;
  descripcion?: string;
}

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

// ==========================================================================
// 2. CONSTANTES GLOBALES Y ESTADO DE LA APLICACIÓN
// ==========================================================================
// Endpoint oficial del backend desplegado en Render (Semana 06)
const API_URL = "https://tecnomarket-vy27.onrender.com/api/productos";

// Catálogo de imágenes ilustrativas de alta fidelidad para el hardware

const IMAGENES_CATEGORIA: Record<string, string> = {
  "Laptops": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80",
  "Procesadores": "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
  "Placas de Video": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80",
  "Monitores": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
  "Memorias RAM": "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80",
  "Almacenamiento": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80",
  "Fuentes de Poder": "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=600&q=80",
  "Periféricos": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
  "General": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
};
// Variables de estado en memoria
let productosOriginales: Producto[] = [];
let carrito: ItemCarrito[] = JSON.parse(localStorage.getItem("tecnomarket_carrito") || "[]");

// Elementos del DOM
const estadoCarga = document.getElementById("estado-carga") as HTMLElement;
const mensajeError = document.getElementById("mensaje-error") as HTMLElement;
const catalogoContainer = document.getElementById("catalogo-container") as HTMLElement;
const destacadosContainer = document.getElementById("destacados-container") as HTMLElement;
const sinResultados = document.getElementById("sin-resultados") as HTMLElement;

const inputBusqueda = document.getElementById("input-busqueda") as HTMLInputElement;
const selectCategoria = document.getElementById("select-categoria") as HTMLSelectElement;
const selectOrden = document.getElementById("select-orden") as HTMLSelectElement;
const selectStock = document.getElementById("select-stock") as HTMLSelectElement;

// Modal Detalle
const modalDetalle = document.getElementById("modal-detalle") as HTMLElement;
const btnCerrarModal = document.getElementById("btn-cerrar-modal") as HTMLButtonElement;
const modalImg = document.getElementById("modal-img") as HTMLImageElement;
const modalCategoria = document.getElementById("modal-categoria") as HTMLElement;
const modalNombre = document.getElementById("modal-nombre") as HTMLElement;
const modalCodigo = document.getElementById("modal-codigo") as HTMLElement;
const modalPrecio = document.getElementById("modal-precio") as HTMLElement;
const modalStock = document.getElementById("modal-stock") as HTMLElement;
const modalDesc = document.getElementById("modal-desc") as HTMLElement;
const modalBtnAgregar = document.getElementById("modal-btn-agregar") as HTMLButtonElement;
let productoSeleccionadoActual: Producto | null = null;

// Drawer Carrito
const drawerCarrito = document.getElementById("drawer-carrito") as HTMLElement;
const btnAbrirCarrito = document.getElementById("btn-abrir-carrito") as HTMLButtonElement;
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito") as HTMLButtonElement;
const carritoOverlay = document.getElementById("carrito-overlay") as HTMLElement;
const carritoItems = document.getElementById("carrito-items") as HTMLElement;
const carritoTotal = document.getElementById("carrito-total") as HTMLElement;
const contadorCarrito = document.getElementById("contador-carrito") as HTMLElement;
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito") as HTMLButtonElement;
const btnComprar = document.getElementById("btn-comprar") as HTMLButtonElement;
const btnReintentar = document.getElementById("btn-reintentar") as HTMLButtonElement;

// ==========================================================================
// 3. CONSUMO ASÍNCRONO DE LA API REST (fetch + async/await)
// ==========================================================================
async function obtenerProductos(): Promise<void> {
  mostrarEstadoCarga(true);
  mostrarError(false);

  try {
    const respuesta = await fetch(API_URL);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const data: Producto[] = await respuesta.json();

    if (!Array.isArray(data)) {
      throw new Error("El formato devuelto por la API no es una lista válida.");
    }

    // 1. Reemplazar electrodomésticos por componentes de hardware
    const listaAdaptada: Producto[] = data.map((item) => {
      // Reemplazo de la Refrigeradora Samsung (P004) -> Monitor Gamer
      if (item.codigo === "P004" || item.categoria === "Refrigeradoras") {
        return {
          id: item.id,
          codigo: "P004",
          nombre: "Monitor Gamer ASUS TUF 27\" 165Hz",
          categoria: "Monitores",
          precio: 1199.90,
          stock: 7,
          descripcion: "Panel IPS QHD (2560x1440) con 165Hz de tasa de refresco, 1ms de tiempo de respuesta y FreeSync Premium."
        };
      }

      // Reemplazo del Microondas LG (P005) -> Memoria RAM DDR5
      if (item.codigo === "P005" || item.categoria === "Microondas") {
        return {
          id: item.id,
          codigo: "P005",
          nombre: "Memoria RAM Corsair Vengeance 32GB (2x16) DDR5",
          categoria: "Memorias RAM",
          precio: 499.90,
          stock: 12,
          descripcion: "Kit de memoria DDR5 a 6000MHz optimizado para placas AMD e Intel con perfiles XMP 3.0."
        };
      }

      // Productos de hardware originales (Laptop, Procesador Ryzen, Placa RTX)
      return {
        ...item,
        descripcion: `Componente informático de alto rendimiento. Garantía oficial para la categoría de ${item.categoria}.`
      };
    });

    // 2. Componentes tecnológicos adicionales para llenar la tienda
    const componentesExtra: Producto[] = [
      {
        id: 6,
        codigo: "P006",
        nombre: "Disco SSD NVMe Kingston KC3000 1TB PCIe 4.0",
        categoria: "Almacenamiento",
        precio: 389.90,
        stock: 20,
        descripcion: "Velocidades extremas de lectura de hasta 7000 MB/s para carga ultrarrápida de sistemas y juegos."
      },
      {
        id: 7,
        codigo: "P007",
        nombre: "Fuente de Poder Corsair RM850e 850W 80+ Gold",
        categoria: "Fuentes de Poder",
        precio: 549.90,
        stock: 9,
        descripcion: "Fuente modular silenciosa con certificación 80 PLUS Gold y soporte para conectores PCIe 5.0."
      },
      {
        id: 8,
        codigo: "P008",
        nombre: "Teclado Mecánico RGB Switch Red",
        categoria: "Periféricos",
        precio: 189.90,
        stock: 15,
        descripcion: "Teclado mecánico ergonómico con iluminación dinámica RGB y respuesta rápida para gaming."
      }
    ];

    // 3. Unir productos y asignar imágenes correspondientes
    const catalogoCompleto = [...listaAdaptada, ...componentesExtra];

    productosOriginales = catalogoCompleto.map((prod) => ({
      ...prod,
      imagen: prod.imagen || IMAGENES_CATEGORIA[prod.categoria] || IMAGENES_CATEGORIA["General"]
    }));

    // Actualizar selectores y vistas dinámicas
    poblarSelectCategorias(productosOriginales);
    renderizarVistas(productosOriginales);
    actualizarCarritoUI();

  } catch (error) {
    console.error("Error al obtener los datos de la API de Render:", error);
    mostrarError(true);
  } finally {
    mostrarEstadoCarga(false);
  }
}

// ==========================================================================
// 4. RENDERIZADO DINÁMICO EN EL DOM
// ==========================================================================
function crearTarjetaProducto(p: Producto): string {
  const stockTexto = p.stock > 0 ? `Stock: ${p.stock}` : "Agotado";
  const imagenUrl = p.imagen || IMAGENES_CATEGORIA["General"];

  return `
    <article class="card-producto">
      <div class="card-img-container">
        <img src="${imagenUrl}" alt="${p.nombre}" loading="lazy">
        <span class="badge-stock">${stockTexto}</span>
      </div>
      <div class="card-body">
        <span class="tag-categoria">${p.categoria}</span>
        <h3>${p.nombre}</h3>
        <p class="codigo-tag">Cód: ${p.codigo}</p>
        <div class="card-precio-box">
          <span class="precio-valor">S/ ${p.precio.toFixed(2)}</span>
        </div>
        <div class="card-acciones">
          <button class="btn-secundario" onclick="abrirModalDetalle(${p.id})">Detalle</button>
          <button class="btn-primario" onclick="agregarAlCarrito(${p.id})">Agregar 🛒</button>
        </div>
      </div>
    </article>
  `;
}

function renderizarVistas(lista: Producto[]): void {
  // 1. Renderizar Destacados (ejemplo: los primeros 3 productos de tecnología)
  const destacados = lista.slice(0, 3);
  destacadosContainer.innerHTML = destacados.map(crearTarjetaProducto).join("");

  // 2. Renderizar Catálogo General
  if (lista.length === 0) {
    catalogoContainer.innerHTML = "";
    sinResultados.classList.remove("oculto");
  } else {
    sinResultados.classList.add("oculto");
    catalogoContainer.innerHTML = lista.map(crearTarjetaProducto).join("");
  }
}

// ==========================================================================
// 5. FILTRADO MULTI-CRITERIO Y BÚSQUEDA
// ==========================================================================
function aplicarFiltros(): void {
  const termino = inputBusqueda.value.toLowerCase().trim();
  const categoriaSeleccionada = selectCategoria.value;
  const orden = selectOrden.value;
  const stockFiltro = selectStock.value;

  let filtrados = productosOriginales.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(termino) ||
      p.codigo.toLowerCase().includes(termino) ||
      p.categoria.toLowerCase().includes(termino);

    const coincideCategoria =
      categoriaSeleccionada === "" || p.categoria === categoriaSeleccionada;

    const coincideStock =
      stockFiltro === "" || (stockFiltro === "en-stock" && p.stock > 0);

    return coincideTexto && coincideCategoria && coincideStock;
  });

  // Ordenamiento por precio
  if (orden === "asc") {
    filtrados.sort((a, b) => a.precio - b.precio);
  } else if (orden === "desc") {
    filtrados.sort((a, b) => b.precio - a.precio);
  }

  renderizarVistas(filtrados);
}

function poblarSelectCategorias(productos: Producto[]): void {
  const categorias = Array.from(new Set(productos.map((p) => p.categoria)));
  selectCategoria.innerHTML = '<option value="">Todas las Categorías</option>';
  categorias.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });
}

// ==========================================================================
// 6. GESTIÓN DEL MODAL DE DETALLE
// ==========================================================================
(window as any).abrirModalDetalle = function (id: number): void {
  const producto = productosOriginales.find((p) => p.id === id);
  if (!producto) return;

  productoSeleccionadoActual = producto;
  modalImg.src = producto.imagen || IMAGENES_CATEGORIA["General"];
  modalImg.alt = producto.nombre;
  modalCategoria.textContent = producto.categoria;
  modalNombre.textContent = producto.nombre;
  modalCodigo.textContent = producto.codigo;
  modalPrecio.textContent = producto.precio.toFixed(2);
  modalStock.textContent = producto.stock > 0 ? `${producto.stock} unidades disponibles` : "Agotado";
  modalDesc.textContent = producto.descripcion || "Información no disponible.";

  modalDetalle.classList.remove("oculto");
};

function cerrarModal(): void {
  modalDetalle.classList.add("oculto");
  productoSeleccionadoActual = null;
}

// ==========================================================================
// 7. GESTIÓN DEL CARRITO DE COMPRAS
// ==========================================================================
(window as any).agregarAlCarrito = function (id: number): void {
  const producto = productosOriginales.find((p) => p.id === id);
  if (!producto) return;

  const itemExistente = carrito.find((item) => item.producto.id === id);

  if (itemExistente) {
    if (itemExistente.cantidad < producto.stock) {
      itemExistente.cantidad++;
    } else {
      alert(`No puedes agregar más unidades de ${producto.nombre}. Stock máximo alcanzado.`);
      return;
    }
  } else {
    carrito.push({ producto, cantidad: 1 });
  }

  guardarYActualizarCarrito();
  abrirDrawerCarrito();
};

(window as any).eliminarDelCarrito = function (id: number): void {
  carrito = carrito.filter((item) => item.producto.id !== id);
  guardarYActualizarCarrito();
};

function guardarYActualizarCarrito(): void {
  localStorage.setItem("tecnomarket_carrito", JSON.stringify(carrito));
  actualizarCarritoUI();
}

function actualizarCarritoUI(): void {
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contadorCarrito.textContent = totalItems.toString();

  if (carrito.length === 0) {
    carritoItems.innerHTML = '<p class="sin-resultados">Tu carrito está vacío.</p>';
    carritoTotal.textContent = "S/ 0.00";
    return;
  }

  let totalMonto = 0;
  carritoItems.innerHTML = carrito
    .map((item) => {
      const subtotal = item.producto.precio * item.cantidad;
      totalMonto += subtotal;
      return `
        <div class="carrito-item">
          <div class="carrito-item-info">
            <h4>${item.producto.nombre}</h4>
            <p>${item.cantidad} x S/ ${item.producto.precio.toFixed(2)} = <strong>S/ ${subtotal.toFixed(2)}</strong></p>
          </div>
          <button class="btn-eliminar-item" onclick="eliminarDelCarrito(${item.producto.id})" title="Quitar">🗑️</button>
        </div>
      `;
    })
    .join("");

  carritoTotal.textContent = `S/ ${totalMonto.toFixed(2)}`;
}

function abrirDrawerCarrito(): void {
  drawerCarrito.classList.remove("oculto");
}

function cerrarDrawerCarrito(): void {
  drawerCarrito.classList.add("oculto");
}

function vaciarCarrito(): void {
  if (confirm("¿Estás seguro de vaciar el carrito?")) {
    carrito = [];
    guardarYActualizarCarrito();
  }
}

// ==========================================================================
// 8. MANEJO DE ESTADOS Y CONTROL DE ERRORES
// ==========================================================================
function mostrarEstadoCarga(mostrar: boolean): void {
  if (mostrar) {
    estadoCarga.classList.remove("oculto");
  } else {
    estadoCarga.classList.add("oculto");
  }
}

function mostrarError(mostrar: boolean): void {
  if (mostrar) {
    mensajeError.classList.remove("oculto");
  } else {
    mensajeError.classList.add("oculto");
  }
}

// ==========================================================================
// 9. EVENT LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  obtenerProductos();

  // Filtros
  inputBusqueda.addEventListener("input", aplicarFiltros);
  selectCategoria.addEventListener("change", aplicarFiltros);
  selectOrden.addEventListener("change", aplicarFiltros);
  selectStock.addEventListener("change", aplicarFiltros);

  // Modal
  btnCerrarModal.addEventListener("click", cerrarModal);
  modalDetalle.addEventListener("click", (e) => {
    if (e.target === modalDetalle) cerrarModal();
  });
  modalBtnAgregar.addEventListener("click", () => {
    if (productoSeleccionadoActual) {
      (window as any).agregarAlCarrito(productoSeleccionadoActual.id);
      cerrarModal();
    }
  });

  // Carrito
  btnAbrirCarrito.addEventListener("click", abrirDrawerCarrito);
  btnCerrarCarrito.addEventListener("click", cerrarDrawerCarrito);
  carritoOverlay.addEventListener("click", cerrarDrawerCarrito);
  btnVaciarCarrito.addEventListener("click", vaciarCarrito);
  btnComprar.addEventListener("click", () => {
    if (carrito.length === 0) {
      alert("El carrito está vacío.");
      return;
    }
    alert("¡Pedido realizado con éxito! En breve nos pondremos en contacto.");
    carrito = [];
    guardarYActualizarCarrito();
    cerrarDrawerCarrito();
  });

  // Reintentar si Render tardó en iniciar
  btnReintentar.addEventListener("click", obtenerProductos);
});