declare const API_BASE_URL = "https://tecnomarket-vy27.onrender.com";
declare const FIREBASE_CONFIG: {
    projectId: string;
    apiKey: string;
    authDomain: string;
};
interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
}
interface Promocion {
    id: number;
    titulo: string;
    descripcion: string;
    descuentoPorcentaje: number;
}
interface ItemCarrito {
    producto: Producto;
    cantidad: number;
}
interface Pedido {
    id: number;
    cliente: string;
    total: number;
    fecha: string;
    estado: string;
}
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}
declare let productos: Producto[];
declare let promociones: Promocion[];
declare let pedidos: Pedido[];
declare let carrito: ItemCarrito[];
declare let categoriaSeleccionada: string;
declare let deferredInstallPrompt: BeforeInstallPromptEvent | null;
declare const SEED_PRODUCTOS: Producto[];
declare const SEED_PROMOCIONES: Promocion[];
declare function mostrarToast(mensaje: string): void;
declare function guardarCacheLocal(): void;
declare function cargarCacheLocal(): void;
declare function sincronizarConBackend(): Promise<void>;
declare function actualizarKPIs(): void;
declare function renderizarProductos(): void;
declare function cargarProductoEnFormulario(id: number): void;
declare function limpiarFormulario(): void;
declare function guardarProducto(e: Event): Promise<void>;
declare function eliminarProducto(id: number): void;
declare function agregarAlCarrito(id: number): void;
declare function renderizarCarrito(): void;
declare function procesarPedido(): void;
declare function renderizarPromociones(): void;
declare function renderizarPedidos(): void;
declare function configurarPWA(): void;
declare function inicializarApp(): void;
//# sourceMappingURL=app.d.ts.map