"use strict";
// ============================================================================
// TECNOMARKET PRO - FRONTEND TYPESCRIPT + RENDER API + FIREBASE + PWA INSTALLER
// ============================================================================
const API_BASE_URL = 'https://tecnomarket-vy27.onrender.com';
// Pega aquí los valores de tu nuevo proyecto Firebase ("tecnomarket-pwa")
const FIREBASE_CONFIG = {
    projectId: 'tecnomarket-pwa',
    apiKey: 'REEMPLAZAR_CON_TU_NUEVA_API_KEY',
    authDomain: 'tecnomarket-pwa.firebaseapp.com'
};
// Estado de la aplicación con respaldo Offline en localStorage
let productos = [];
let promociones = [];
let pedidos = [];
let carrito = [];
let categoriaSeleccionada = 'Todas';
let deferredInstallPrompt = null;
const SEED_PRODUCTOS = [
    { id: 1, codigo: 'GPU-RTX4070', nombre: 'NVIDIA GeForce RTX 4070 Super 12GB', categoria: 'Tarjetas Gráficas', precio: 2890, stock: 8 },
    { id: 2, codigo: 'CPU-RYZEN7', nombre: 'AMD Ryzen 7 7800X3D AM5', categoria: 'Procesadores', precio: 1750, stock: 12 },
    { id: 3, codigo: 'SSD-NVME2T', nombre: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe', categoria: 'Almacenamiento', precio: 720, stock: 20 },
    { id: 4, codigo: 'PER-LOGIGPRO', nombre: 'Mouse Logitech G Pro X Superlight 2', categoria: 'Periféricos', precio: 540, stock: 15 },
    { id: 5, codigo: 'LAP-ASUSROG', nombre: 'ASUS ROG Strix G16 i9 / RTX 4060', categoria: 'Laptops', precio: 6490, stock: 4 }
];
const SEED_PROMOCIONES = [
    { id: 1, titulo: 'Cyber Ingeniería Sistemas', descripcion: 'Descuento directo en procesadores AMD Ryzen y GPUs RTX.', descuentoPorcentaje: 15 },
    { id: 2, titulo: 'Pack Upgrade Almacenamiento', descripcion: 'Unidades NVMe Gen4 con envío gratis e instalación.', descuentoPorcentaje: 10 }
];
// Utilidad de notificaciones Toast
function mostrarToast(mensaje) {
    const container = document.getElementById('toast-container');
    if (!container)
        return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensaje;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3400);
}
// Persistencia local para soporte Offline
function guardarCacheLocal() {
    localStorage.setItem('tm_productos', JSON.stringify(productos));
    localStorage.setItem('tm_pedidos', JSON.stringify(pedidos));
    localStorage.setItem('tm_carrito', JSON.stringify(carrito));
}
function cargarCacheLocal() {
    const prodGuardados = localStorage.getItem('tm_productos');
    const pedGuardados = localStorage.getItem('tm_pedidos');
    const carGuardado = localStorage.getItem('tm_carrito');
    productos = prodGuardados ? JSON.parse(prodGuardados) : [...SEED_PRODUCTOS];
    pedidos = pedGuardados ? JSON.parse(pedGuardados) : [];
    carrito = carGuardado ? JSON.parse(carGuardado) : [];
    promociones = [...SEED_PROMOCIONES];
}
// Sincronización con el Backend en Render
async function sincronizarConBackend() {
    const lblLatencia = document.getElementById('api-latencia');
    const lblSync = document.getElementById('diag-sync');
    const inicio = performance.now();
    try {
        const resp = await fetch(`${API_BASE_URL}/api/productos`);
        if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data) && data.length > 0) {
                productos = data;
            }
            const ms = Math.round(performance.now() - inicio);
            if (lblLatencia)
                lblLatencia.textContent = `Online (${ms} ms)`;
        }
        else {
            if (lblLatencia)
                lblLatencia.textContent = 'Modo Caché';
        }
    }
    catch {
        if (lblLatencia)
            lblLatencia.textContent = 'Respaldo Local';
    }
    if (lblSync) {
        lblSync.textContent = new Date().toLocaleTimeString();
    }
    guardarCacheLocal();
    actualizarKPIs();
    renderizarProductos();
}
// Actualizar tarjetas KPI superiores
function actualizarKPIs() {
    const elProd = document.getElementById('kpi-total-productos');
    const elStock = document.getElementById('kpi-total-stock');
    const elValor = document.getElementById('kpi-valor-inventario');
    const elPedidos = document.getElementById('kpi-total-pedidos');
    const totalStock = productos.reduce((acc, p) => acc + Number(p.stock || 0), 0);
    const valorTotal = productos.reduce((acc, p) => acc + Number(p.precio || 0) * Number(p.stock || 0), 0);
    if (elProd)
        elProd.textContent = String(productos.length);
    if (elStock)
        elStock.textContent = String(totalStock);
    if (elValor)
        elValor.textContent = `S/ ${valorTotal.toFixed(2)}`;
    if (elPedidos)
        elPedidos.textContent = String(pedidos.length);
}
// Renderizado del catálogo de productos
function renderizarProductos() {
    const grid = document.getElementById('grid-productos');
    const inputBuscar = document.getElementById('input-buscar');
    if (!grid)
        return;
    const termino = (inputBuscar?.value || '').toLowerCase().trim();
    const filtrados = productos.filter((p) => {
        const coincideCat = categoriaSeleccionada === 'Todas' || p.categoria === categoriaSeleccionada;
        const coincideTexto = p.nombre.toLowerCase().includes(termino) ||
            p.codigo.toLowerCase().includes(termino) ||
            p.categoria.toLowerCase().includes(termino);
        return coincideCat && coincideTexto;
    });
    if (filtrados.length === 0) {
        grid.innerHTML = `<p style="color:#94a3b8;">No se encontraron componentes con ese filtro.</p>`;
        return;
    }
    grid.innerHTML = filtrados
        .map((p) => `
      <article class="product-card">
        <div>
          <div class="card-top">
            <span class="sku-tag">${p.codigo}</span>
            <span class="stock-tag ${p.stock <= 5 ? 'low' : ''}">Stock: ${p.stock}</span>
          </div>
          <h3 class="product-title">${p.nombre}</h3>
          <span class="product-cat">${p.categoria}</span>
        </div>
        <div>
          <div class="product-price">S/ ${Number(p.precio).toFixed(2)}</div>
          <div class="card-actions">
            <button class="btn btn-primary" data-add="${p.id}">+ Carrito</button>
            <button class="btn btn-outline" data-edit="${p.id}">✏️</button>
            <button class="btn btn-danger" data-del="${p.id}">🗑️</button>
          </div>
        </div>
      </article>
    `)
        .join('');
    // Eventos de los botones de cada tarjeta
    grid.querySelectorAll('[data-add]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-add'));
            agregarAlCarrito(id);
        });
    });
    grid.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-edit'));
            cargarProductoEnFormulario(id);
        });
    });
    grid.querySelectorAll('[data-del]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-del'));
            eliminarProducto(id);
        });
    });
}
// CRUD de Productos
function cargarProductoEnFormulario(id) {
    const prod = productos.find((p) => p.id === id);
    if (!prod)
        return;
    document.getElementById('prod-id').value = String(prod.id);
    document.getElementById('prod-codigo').value = prod.codigo;
    document.getElementById('prod-nombre').value = prod.nombre;
    document.getElementById('prod-categoria').value = prod.categoria;
    document.getElementById('prod-precio').value = String(prod.precio);
    document.getElementById('prod-stock').value = String(prod.stock);
    const titulo = document.getElementById('form-titulo');
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    if (titulo)
        titulo.textContent = 'Editar Componente';
    if (btnCancelar)
        btnCancelar.style.display = 'block';
}
function limpiarFormulario() {
    const form = document.getElementById('form-producto');
    form?.reset();
    document.getElementById('prod-id').value = '';
    const titulo = document.getElementById('form-titulo');
    const btnCancelar = document.getElementById('btn-cancelar-edicion');
    if (titulo)
        titulo.textContent = 'Registrar Componente';
    if (btnCancelar)
        btnCancelar.style.display = 'none';
}
async function guardarProducto(e) {
    e.preventDefault();
    const idStr = document.getElementById('prod-id').value;
    const nuevo = {
        id: idStr ? Number(idStr) : Date.now(),
        codigo: document.getElementById('prod-codigo').value.trim(),
        nombre: document.getElementById('prod-nombre').value.trim(),
        categoria: document.getElementById('prod-categoria').value,
        precio: Number(document.getElementById('prod-precio').value),
        stock: Number(document.getElementById('prod-stock').value)
    };
    if (idStr) {
        productos = productos.map((p) => (p.id === nuevo.id ? nuevo : p));
        mostrarToast(`Componente ${nuevo.codigo} actualizado.`);
    }
    else {
        productos.unshift(nuevo);
        mostrarToast(`Componente ${nuevo.codigo} registrado en catálogo.`);
    }
    guardarCacheLocal();
    actualizarKPIs();
    renderizarProductos();
    limpiarFormulario();
    // Envío asíncrono al backend en Render si está en línea
    try {
        await fetch(`${API_BASE_URL}/api/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevo)
        });
    }
    catch {
        // Guardado garantizado localmente en modo offline
    }
}
function eliminarProducto(id) {
    productos = productos.filter((p) => p.id !== id);
    guardarCacheLocal();
    actualizarKPIs();
    renderizarProductos();
    mostrarToast('Componente eliminado del inventario.');
}
// Gestión del Carrito y Pedidos
function agregarAlCarrito(id) {
    const prod = productos.find((p) => p.id === id);
    if (!prod)
        return;
    const existente = carrito.find((item) => item.producto.id === id);
    if (existente) {
        existente.cantidad += 1;
    }
    else {
        carrito.push({ producto: prod, cantidad: 1 });
    }
    guardarCacheLocal();
    renderizarCarrito();
    mostrarToast(`${prod.nombre} agregado al carrito.`);
}
function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const contador = document.getElementById('carrito-contador');
    const totalEl = document.getElementById('carrito-total');
    const totalItems = carrito.reduce((acc, i) => acc + i.cantidad, 0);
    const montoTotal = carrito.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
    if (contador)
        contador.textContent = String(totalItems);
    if (totalEl)
        totalEl.textContent = `S/ ${montoTotal.toFixed(2)}`;
    if (!contenedor)
        return;
    if (carrito.length === 0) {
        contenedor.innerHTML = `<p style="color:#94a3b8;">Tu carrito está vacío.</p>`;
        return;
    }
    contenedor.innerHTML = carrito
        .map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.producto.nombre}</strong>
          <div style="font-size:0.78rem; color:#94a3b8;">
            ${item.cantidad} x S/ ${item.producto.precio.toFixed(2)}
          </div>
        </div>
        <strong>S/ ${(item.cantidad * item.producto.precio).toFixed(2)}</strong>
      </div>
    `)
        .join('');
}
function procesarPedido() {
    if (carrito.length === 0) {
        mostrarToast('Agrega al menos un componente al carrito.');
        return;
    }
    const inputCliente = document.getElementById('cliente-nombre');
    const cliente = inputCliente?.value.trim() || 'Cliente General TecnoMarket';
    const total = carrito.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
    const nuevoPedido = {
        id: Date.now(),
        cliente,
        total,
        fecha: new Date().toLocaleString(),
        estado: navigator.onLine ? 'Sincronizado Render/Cloud' : 'Guardado Offline (Pendiente)'
    };
    pedidos.unshift(nuevoPedido);
    carrito = [];
    guardarCacheLocal();
    renderizarCarrito();
    renderizarPedidos();
    actualizarKPIs();
    document.getElementById('modal-carrito')?.classList.remove('open');
    mostrarToast(`Pedido #${nuevoPedido.id.toString().slice(-4)} emitido correctamente.`);
}
function renderizarPromociones() {
    const grid = document.getElementById('grid-promociones');
    if (!grid)
        return;
    grid.innerHTML = promociones
        .map((pr) => `
      <article class="promo-card">
        <span class="promo-discount">-${pr.descuentoPorcentaje}% OFF</span>
        <h3>${pr.titulo}</h3>
        <p style="color:#94a3b8; font-size:0.88rem; margin-top:0.4rem;">${pr.descripcion}</p>
      </article>
    `)
        .join('');
}
function renderizarPedidos() {
    const lista = document.getElementById('lista-pedidos');
    if (!lista)
        return;
    if (pedidos.length === 0) {
        lista.innerHTML = `<p style="color:#94a3b8;">Aún no hay pedidos registrados.</p>`;
        return;
    }
    lista.innerHTML = pedidos
        .map((pe) => `
      <div class="order-item">
        <div>
          <strong>Pedido #${pe.id.toString().slice(-5)} - ${pe.cliente}</strong>
          <div style="font-size:0.78rem; color:#94a3b8;">${pe.fecha} · ${pe.estado}</div>
        </div>
        <strong style="color:#38bdf8; font-size:1.1rem;">S/ ${pe.total.toFixed(2)}</strong>
      </div>
    `)
        .join('');
}
// ============================================================================
// CONFIGURACIÓN PWA: SERVICE WORKER E INSTALADOR DE ESCRITORIO
// ============================================================================
function configurarPWA() {
    const btnInstalar = document.getElementById('btn-instalar-pwa');
    const diagSw = document.getElementById('diag-sw');
    const diagDisplay = document.getElementById('diag-display');
    const badgeConexion = document.getElementById('conexion-badge');
    const textoConexion = document.getElementById('conexion-texto');
    const fbEstado = document.getElementById('firebase-estado');
    if (fbEstado) {
        fbEstado.textContent = FIREBASE_CONFIG.projectId;
    }
    // Detectar si ya corre como aplicación de escritorio instalada (Standalone)
    const esStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (diagDisplay) {
        diagDisplay.textContent = esStandalone ? 'App de Escritorio (Standalone)' : 'Navegador Web';
    }
    // 1. Registro del Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const reg = await navigator.serviceWorker.register('./service-worker.js');
                if (diagSw)
                    diagSw.textContent = 'Activo (Cache ON)';
                console.log('[PWA] Service Worker activo:', reg.scope);
            }
            catch (err) {
                if (diagSw)
                    diagSw.textContent = 'Error en SW';
                console.error('[PWA] Error registrando SW:', err);
            }
        });
    }
    // 2. Capturar el evento beforeinstallprompt para habilitar el instalador
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (btnInstalar) {
            btnInstalar.style.display = 'inline-flex';
        }
    });
    // 3. Disparar ventana nativa de instalación en escritorio
    btnInstalar?.addEventListener('click', async () => {
        if (!deferredInstallPrompt)
            return;
        await deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            mostrarToast('Instalando TecnoMarket en tu escritorio...');
        }
        deferredInstallPrompt = null;
        btnInstalar.style.display = 'none';
    });
    window.addEventListener('appinstalled', () => {
        if (btnInstalar)
            btnInstalar.style.display = 'none';
        if (diagDisplay)
            diagDisplay.textContent = 'App Instalada en Escritorio';
        mostrarToast('¡TecnoMarket ya está instalado en tu Escritorio!');
    });
    // 4. Estado Online / Offline en vivo
    const actualizarRed = () => {
        const online = navigator.onLine;
        if (textoConexion)
            textoConexion.textContent = online ? 'Online' : 'Modo Offline';
        badgeConexion?.classList.toggle('offline', !online);
    };
    window.addEventListener('online', actualizarRed);
    window.addEventListener('offline', actualizarRed);
    actualizarRed();
}
// Inicialización general
function inicializarApp() {
    cargarCacheLocal();
    actualizarKPIs();
    renderizarProductos();
    renderizarPromociones();
    renderizarPedidos();
    renderizarCarrito();
    configurarPWA();
    sincronizarConBackend();
    // Eventos de interfaz
    document.getElementById('form-producto')?.addEventListener('submit', guardarProducto);
    document.getElementById('btn-cancelar-edicion')?.addEventListener('click', limpiarFormulario);
    document.getElementById('input-buscar')?.addEventListener('input', renderizarProductos);
    document.getElementById('btn-sincronizar')?.addEventListener('click', () => {
        mostrarToast('Sincronizando catálogo con Render...');
        sincronizarConBackend();
    });
    // Filtro de categorías por chips
    document.querySelectorAll('#contenedor-categorias .chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#contenedor-categorias .chip').forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            categoriaSeleccionada = chip.getAttribute('data-cat') || 'Todas';
            renderizarProductos();
        });
    });
    // Cambio de pestañas (Catálogo / Promociones / Pedidos)
    document.querySelectorAll('.view-tabs .tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-tabs .tab-btn').forEach((b) => b.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach((s) => s.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            if (targetId)
                document.getElementById(targetId)?.classList.add('active');
        });
    });
    // Abrir / Cerrar Carrito
    document.getElementById('btn-abrir-carrito')?.addEventListener('click', () => {
        document.getElementById('modal-carrito')?.classList.add('open');
    });
    document.getElementById('btn-cerrar-carrito')?.addEventListener('click', () => {
        document.getElementById('modal-carrito')?.classList.remove('open');
    });
    document.getElementById('btn-vaciar-carrito')?.addEventListener('click', () => {
        carrito = [];
        guardarCacheLocal();
        renderizarCarrito();
    });
    document.getElementById('btn-procesar-pedido')?.addEventListener('click', procesarPedido);
}
document.addEventListener('DOMContentLoaded', inicializarApp);
//# sourceMappingURL=app.js.map