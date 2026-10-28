interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    categoria: string;
    marca: string;
    modelo: string;
    garantia: string;
    precio: number;
    stock: number;
    descuento: number;
    imagen: string;
    descripcion: string;
}
declare const API_URL = "https://tecnomarket-vy27.onrender.com/api/productos";
declare const form: HTMLFormElement;
declare const tabla: HTMLTableSectionElement;
declare const mensaje: HTMLDivElement;
declare const buscar: HTMLInputElement;
declare const btnGuardar: HTMLButtonElement;
declare const btnCancelar: HTMLButtonElement;
declare const estadoCarga: HTMLParagraphElement;
declare const contador: HTMLSpanElement;
declare const tituloFormulario: HTMLHeadingElement;
declare let productos: Producto[];
declare let idEdicion: number | null;
declare function mostrarMensaje(texto: string, tipo?: "ok" | "error"): void;
declare function limpiarMensaje(): void;
declare function solicitar(url: string, opciones?: RequestInit): Promise<any>;
declare function cargarProductos(): Promise<boolean>;
declare function crearCelda(texto: string | number | undefined | null): HTMLTableCellElement;
declare function renderizarTabla(): void;
declare function editarProducto(id: number): Promise<void>;
declare function eliminarProducto(id: number): Promise<void>;
declare function cancelarEdicion(): void;
//# sourceMappingURL=app.d.ts.map