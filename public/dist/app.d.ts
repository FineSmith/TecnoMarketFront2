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
interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
}
interface Promocion {
    id: number;
    titulo: string;
    descuento: number;
    categoria: string;
}
interface Pedido {
    id: number;
    cliente: string;
    items?: string[];
    total: number;
    estado: string;
}
declare const API_URL = "https://tecnomarket-vy27.onrender.com/api/productos";
declare const API_CATEGORIAS = "https://tecnomarket-vy27.onrender.com/api/categorias";
declare const API_PROMOCIONES = "https://tecnomarket-vy27.onrender.com/api/promociones";
declare const API_PEDIDOS = "https://tecnomarket-vy27.onrender.com/api/pedidos";
declare const IMAGENES_CATEGORIA: Record<string, string>;
declare let productosOriginales: Producto[];
declare let carrito: ItemCarrito[];
declare const estadoCarga: HTMLElement;
declare const mensajeError: HTMLElement;
declare const catalogoContainer: HTMLElement;
declare const destacadosContainer: HTMLElement;
declare const sinResultados: HTMLElement;
declare const inputBusqueda: HTMLInputElement;
declare const selectCategoria: HTMLSelectElement;
declare const selectOrden: HTMLSelectElement;
declare const selectStock: HTMLSelectElement;
declare const modalDetalle: HTMLElement;
declare const btnCerrarModal: HTMLButtonElement;
declare const modalImg: HTMLImageElement;
declare const modalCategoria: HTMLElement;
declare const modalNombre: HTMLElement;
declare const modalCodigo: HTMLElement;
declare const modalPrecio: HTMLElement;
declare const modalStock: HTMLElement;
declare const modalDesc: HTMLElement;
declare const modalBtnAgregar: HTMLButtonElement;
declare let productoSeleccionadoActual: Producto | null;
declare const drawerCarrito: HTMLElement;
declare const btnAbrirCarrito: HTMLButtonElement;
declare const btnCerrarCarrito: HTMLButtonElement;
declare const carritoOverlay: HTMLElement;
declare const carritoItems: HTMLElement;
declare const carritoTotal: HTMLElement;
declare const contadorCarrito: HTMLElement;
declare const btnVaciarCarrito: HTMLButtonElement;
declare const btnComprar: HTMLButtonElement;
declare const btnReintentar: HTMLButtonElement;
declare function obtenerProductos(): Promise<void>;
declare function obtenerCategorias(): Promise<void>;
declare function obtenerPromociones(): Promise<void>;
declare function obtenerPedidos(): Promise<void>;
declare function crearTarjetaProducto(p: Producto): string;
declare function renderizarVistas(lista: Producto[]): void;
declare function aplicarFiltros(): void;
declare function poblarSelectCategorias(productos: Producto[]): void;
declare function cerrarModal(): void;
declare function guardarYActualizarCarrito(): void;
declare function actualizarCarritoUI(): void;
declare function abrirDrawerCarrito(): void;
declare function cerrarDrawerCarrito(): void;
declare function vaciarCarrito(): void;
declare function mostrarEstadoCarga(mostrar: boolean): void;
declare function mostrarError(mostrar: boolean): void;
//# sourceMappingURL=app.d.ts.map