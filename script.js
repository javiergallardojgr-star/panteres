// CONFIGURACIÓN - REEMPLAZA CON TU ID DE GOOGLE SHEET
const SHEET_ID = '1QIfsqyip9erBKqNFdpif7c3y1Mh0TRqnCuADppsONi8';
const SHEET_TITLE = 'Hoja 1'; // Nombre de la pestaña inferior del sheet
const SHEET_RANGE = 'A1:Z1000';

const FULL_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

let rawData = [];
let headers = [];

async function fetchData() {
    try {
        const response = await fetch(FULL_URL);
        const text = await response.text();
        // Limpiar respuesta JSON de Google
        const data = JSON.parse(text.substr(47).slice(0, -2));
        
        headers = data.table.cols.map(col => col.label || "Sin Título");
        rawData = data.table.rows.map(row => {
            return row.c.map(cell => (cell ? cell.v : ""));
        });

        renderTable(rawData);
        renderFilters();
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        console.error("Error cargando datos:", error);
        document.getElementById('loading').innerHTML = "Error al cargar los datos. Verifica el ID del Sheet.";
    }
}

function renderTable(data) {
    const headerRow = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
    
    headerRow.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
    
    tableBody.innerHTML = data.map(row => `
        <tr>
            ${row.map((cell, index) => {
                // Lógica de colores condicionales (ejemplo basado en contenido)
                const style = getCellStyle(cell, index);
                return `<td style="${style}">${cell}</td>`;
            }).join('')}
        </tr>
    `).join('');
}

// Función para replicar colores del Sheet manualmente (ya que CSV no trae estilos CSS)
function getCellStyle(value, columnIndex) {
    // Ejemplo: Si la celda dice "Completado", poner fondo verde
    if (String(value).toLowerCase() === 'completado') return 'background-color: #dcfce7; color: #166534; font-weight: bold; border-radius: 4px;';
    if (String(value).toLowerCase() === 'pendiente') return 'background-color: #fef9c3; color: #854d0e;';
    
    // Si es un encabezado específico o valor numérico
    if (!isNaN(value) && value !== "") return 'text-align: right; font-family: monospace;';
    
    return '';
}

// Buscador dinámico
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = rawData.filter(row => 
        row.some(cell => String(cell).toLowerCase().includes(term))
    );
    renderTable(filtered);
});

// Inicializar
fetchData();
