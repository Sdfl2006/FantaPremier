const MI_EQUIPO_KEY = 'miEquipoPremier';

function getInitialMiEquipo() {
    return {
        nombre: '',
        jugadores: []
    };
}

function loadMiEquipo() {
    const data = localStorage.getItem(MI_EQUIPO_KEY);
    return data ? JSON.parse(data) : getInitialMiEquipo();
}

function saveMiEquipo(equipo) {
    localStorage.setItem(MI_EQUIPO_KEY, JSON.stringify(equipo));
}

function renderMiEquipo() {
    const equipo = loadMiEquipo();
    document.getElementById('team-name').value = equipo.nombre;

    // Limpiar todos los tbodies
    ['porterias', 'defensores', 'mediocampistas', 'delanteros'].forEach(pos => {
        document.getElementById(pos + '-tbody').innerHTML = '';
    });

    equipo.jugadores.forEach((jugador, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${jugador.nombre}</td>
            <td>${jugador.equipo}</td>
            <td>${posicionToText(jugador.posicion)}</td>
            <td>
                <button class="edit-btn" onclick="editarMiJugador(${idx})">Editar</button>
                <button class="delete-btn" onclick="eliminarMiJugador(${idx})">Eliminar</button>
            </td>
        `;
        document.getElementById(jugador.posicion + '-tbody').appendChild(tr);
    });
}

function posicionToText(pos) {
    switch(pos) {
        case 'porterias': return 'Portero';
        case 'defensores': return 'Defensor';
        case 'mediocampistas': return 'Mediocampista';
        case 'delanteros': return 'Delantero';
        default: return pos;
    }
}

function guardarNombreEquipo(nombre) {
    const equipo = loadMiEquipo();
    equipo.nombre = nombre;
    saveMiEquipo(equipo);
    renderMiEquipo();
}

// Guardar al perder el foco o presionar Enter
const teamNameInput = document.getElementById('team-name');
teamNameInput.addEventListener('blur', function() {
    guardarNombreEquipo(this.value.trim());
});
teamNameInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        guardarNombreEquipo(this.value.trim());
        this.blur();
    }
});

// Elimina el submit del formulario si existe
document.getElementById('team-name-form').addEventListener('submit', function(e) {
    e.preventDefault();
});

// Solo un botón para agregar jugador
document.getElementById('add-my-player-btn').addEventListener('click', function() {
    openMiJugadorModal();
});

function puedeAgregar(posicion, idxEdit = null) {
    const equipo = loadMiEquipo();
    const counts = {
        'porterias': 2,
        'defensores': 6,
        'mediocampistas': 6,
        'delanteros': 4
    };
    const actual = equipo.jugadores.filter((j, idx) => j.posicion === posicion && idx !== idxEdit).length;
    return actual < counts[posicion];
}

function guardarMiJugador(jugador, idx = null) {
    const equipo = loadMiEquipo();
    if (!puedeAgregar(jugador.posicion, idx)) {
        alert('Límite de jugadores para esa posición alcanzado.');
        return;
    }
    if (idx !== null) {
        equipo.jugadores[idx] = jugador;
    } else {
        equipo.jugadores.push(jugador);
    }
    saveMiEquipo(equipo);
    renderMiEquipo();
    cerrarModal();
}

function eliminarMiJugador(idx) {
    const equipo = loadMiEquipo();
    equipo.jugadores.splice(idx, 1);
    saveMiEquipo(equipo);
    renderMiEquipo();
}

window.editarMiJugador = function(idx) {
    const equipo = loadMiEquipo();
    openMiJugadorModal(equipo.jugadores[idx], idx);
};

function openMiJugadorModal(jugador = null, idx = null, posicion = null) {
    document.getElementById('mi-jugador-form').reset();
    document.getElementById('mi-jugador-id').value = idx !== null ? idx : '';
    if (jugador) {
        document.getElementById('mi-jugador-nombre').value = jugador.nombre;
        document.getElementById('player-team').value = jugador.equipo;
        document.getElementById('mi-jugador-posicion').value = jugador.posicion;
    } else if (posicion) {
        document.getElementById('mi-jugador-posicion').value = posicion;
    }
    document.getElementById('mi-jugador-modal').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('mi-jugador-modal').style.display = 'none';
}

document.getElementById('close-mi-jugador-modal').onclick = cerrarModal;

document.getElementById('mi-jugador-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const idx = document.getElementById('mi-jugador-id').value;
    const jugador = {
        nombre: document.getElementById('mi-jugador-nombre').value,
        equipo: document.getElementById('player-team').value,
        posicion: document.getElementById('mi-jugador-posicion').value
    };
    guardarMiJugador(jugador, idx !== '' ? parseInt(idx) : null);
});

window.eliminarMiJugador = eliminarMiJugador;

document.addEventListener('DOMContentLoaded', renderMiEquipo);