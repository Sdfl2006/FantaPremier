// Player data structure
let players = {
    porterias: [],
    defensores: [],
    mediocampistas: [],
    delanteros: []
};

// Add selected and possession fields to sample data
function initializeSampleData() {
    return {
        porterias: [
        ],
        defensores: [
        ],
        mediocampistas: [
        ],
        delanteros: [
        ]
    };
}

// Current player being edited
let currentPlayer = null;

// Position details mapping
const positionDetails = {
    porterias: [
        { value: 'POR', label: 'Portero (POR)' }
    ],
    defensores: [
        { value: 'LD', label: 'Lateral Derecho (LD)' },
        { value: 'LI', label: 'Lateral Izquierdo (LI)' },
        { value: 'DFC', label: 'Defensa Central (DFC)' }
    ],
    mediocampistas: [
        { value: 'MC', label: 'Mediocampista Central (MC)' },
        { value: 'MCD', label: 'Mediocampista Defensivo (MCD)' },
        { value: 'MD', label: 'Mediocampista Derecho (MD)' },
        { value: 'MI', label: 'Mediocampista Izquierdo (MI)' },
        { value: 'MCO', label: 'Mediocampista Ofensivo (MCO)' }
    ],
    delanteros: [
        { value: 'EI', label: 'Extremo Izquierdo (EI)' },
        { value: 'ED', label: 'Extremo Derecho (ED)' },
        { value: 'DC', label: 'Delantero Centro (DC)' }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load players from localStorage if available
    loadPlayers();
    
    // Render initial data
    renderAllTables();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up position detail dropdown
    setupPositionDetailDropdown();
});

// Set up event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Add player buttons
    document.querySelectorAll('.add-player-btn').forEach(button => {
        button.addEventListener('click', function() {
            const position = this.getAttribute('data-position');
            openPlayerModal(null, position);
        });
    });
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closePlayerModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('player-modal');
        if (event.target === modal) {
            closePlayerModal();
        }
    });
    
    // Player form submission
    document.getElementById('player-form').addEventListener('submit', function(e) {
        e.preventDefault();
        savePlayer();
    });
    
    // Position change event to update position detail dropdown
    document.getElementById('player-position').addEventListener('change', function() {
        updatePositionDetailOptions(this.value);
        // Show/hide clean sheets field based on position
        const cleanSheetsGroup = document.getElementById('clean-sheets-group');
        const goalsGroup = document.getElementById('player-goals').closest('.form-group');
        const assistsGroup = document.getElementById('player-assists').closest('.form-group');
        
        if (this.value === 'porterias') {
            // Show clean sheets, hide goals and assists
            cleanSheetsGroup.style.display = 'block';
            goalsGroup.style.display = 'none';
            assistsGroup.style.display = 'none';
        } else {
            // Hide clean sheets, show goals and assists
            cleanSheetsGroup.style.display = 'none';
            goalsGroup.style.display = 'block';
            assistsGroup.style.display = 'block';
        }
    });
}

// Set up position detail dropdown
function setupPositionDetailDropdown() {
    const positionDetailSelect = document.getElementById('player-position-detail');
    // Initially populate with porterias options
    updatePositionDetailOptions('porterias');
}

// Update position detail options based on general position
function updatePositionDetailOptions(position) {
    const positionDetailSelect = document.getElementById('player-position-detail');
    positionDetailSelect.innerHTML = '';
    
    positionDetails[position].forEach(detail => {
        const option = document.createElement('option');
        option.value = detail.value;
        option.textContent = detail.label;
        positionDetailSelect.appendChild(option);
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab pane
    const tabPane = document.getElementById(tabId);
    if (tabPane) {
        tabPane.classList.add('active');
    }
    
    // Add active class to the clicked tab button
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }

     updateTotalPlayersButton();
}

// Render all tables
function renderAllTables() {
    renderTable('porterias');
    renderTable('defensores');
    renderTable('mediocampistas');
    renderTable('delanteros');
    updateTotalPlayersButton();
}

// Render a specific table
function renderTable(position) {
    const tbody = document.getElementById(`${position}-tbody`);
    tbody.innerHTML = '';
    
    players[position].forEach((player, index) => {
        const row = document.createElement('tr');
        // Add selected class if player is selected
        if (player.selected) {
            row.classList.add('selected');
        }
        if (player.pickType) {
            row.classList.add(player.pickType);
        }

        if (position === 'porterias') {
            // Special rendering for goalkeepers
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.team || ''}</td>
                <td>${player.cleanSheets || ''}</td>
                <td>${player.rating}</td>
                <td>${player.possession ? 'Sí' : 'No'}</td>
                <td>
                    <button class="move-btn" data-position="${position}" data-index="${index}" data-direction="up" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="move-btn" data-position="${position}" data-index="${index}" data-direction="down" ${index === players[position].length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="edit-btn" data-position="${position}" data-index="${index}">Editar</button>
                    <button class="delete-btn" data-position="${position}" data-index="${index}">Eliminar</button>
                    <button class="select-btn" data-position="${position}" data-index="${index}">${player.selected ? ' Pulsa para marcar como no seleccionado ' : ' Pulsa para marcar como seleccionado '}</button>
                </td>
            `;
        } else {
            // Regular rendering for other positions
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.positionDetail || ''}</td>
                <td>${player.team || ''}</td>
                <td>${player.goals}</td>
                <td>${player.assists}</td>
                <td>${player.rating}</td>
                <td>${player.possession ? 'Sí' : 'No'}</td>
                <td>
                    <button class="move-btn" data-position="${position}" data-index="${index}" data-direction="up" ${index === 0 ? 'disabled' : ''}>↑</button>
                    <button class="move-btn" data-position="${position}" data-index="${index}" data-direction="down" ${index === players[position].length - 1 ? 'disabled' : ''}>↓</button>
                    <button class="edit-btn" data-position="${position}" data-index="${index}">Editar</button>
                    <button class="delete-btn" data-position="${position}" data-index="${index}">Eliminar</button>
                    <button class="select-btn" data-position="${position}" data-index="${index}">${player.selected ? ' Pulsa para marcar como no seleccionado ' : ' Pulsa para marcar como seleccionado '}</button>
                </td>
            `;
        }
        tbody.appendChild(row);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll(`#${position}-tbody .edit-btn`).forEach(button => {
        button.addEventListener('click', function() {
            const position = this.getAttribute('data-position');
            const index = parseInt(this.getAttribute('data-index'));
            editPlayer(position, index);
        });
    });
    
    document.querySelectorAll(`#${position}-tbody .delete-btn`).forEach(button => {
        button.addEventListener('click', function() {
            const position = this.getAttribute('data-position');
            const index = parseInt(this.getAttribute('data-index'));
            deletePlayer(position, index);
        });
    });
    
    document.querySelectorAll(`#${position}-tbody .move-btn`).forEach(button => {
        button.addEventListener('click', function() {
            const position = this.getAttribute('data-position');
            const index = parseInt(this.getAttribute('data-index'));
            const direction = this.getAttribute('data-direction');
            movePlayer(position, index, direction);
        });
    });
    
    document.querySelectorAll(`#${position}-tbody .select-btn`).forEach(button => {
        button.addEventListener('click', function() {
            const position = this.getAttribute('data-position');
            const index = parseInt(this.getAttribute('data-index'));
            togglePlayerSelection(position, index);
        });
    });
}

// Open player modal
function openPlayerModal(player, position) {
    const modal = document.getElementById('player-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('player-form');
    
    // Show/hide fields based on position
    const cleanSheetsGroup = document.getElementById('clean-sheets-group');
    const goalsGroup = document.getElementById('player-goals').closest('.form-group');
    const assistsGroup = document.getElementById('player-assists').closest('.form-group');
    
    if (player) {
        // Editing existing player
        title.textContent = 'Editar Jugador';
        document.getElementById('player-id').value = player.id;
        document.getElementById('player-name').value = player.name;
        document.getElementById('player-rating').value = player.rating;
        document.getElementById('player-position').value = player.position || position;
        document.getElementById('player-team').value = player.team || '';
        document.getElementById('player-possession').checked = player.possession || false;
        
        // Set position detail
        if (player.positionDetail) {
            document.getElementById('player-position-detail').value = player.positionDetail;
        }
        
        // Set fields based on position
        if (player.position === 'porterias') {
            // Show clean sheets, hide goals and assists
            cleanSheetsGroup.style.display = 'block';
            goalsGroup.style.display = 'none';
            assistsGroup.style.display = 'none';
            
            // Set clean sheets if they exist
            if (player.cleanSheets !== undefined) {
                document.getElementById('player-clean-sheets').value = player.cleanSheets;
            }
        } else {
            // Hide clean sheets, show goals and assists
            cleanSheetsGroup.style.display = 'none';
            goalsGroup.style.display = 'block';
            assistsGroup.style.display = 'block';
            
            // Set goals and assists if they exist
            if (player.goals !== undefined) {
                document.getElementById('player-goals').value = player.goals;
            }
            if (player.assists !== undefined) {
                document.getElementById('player-assists').value = player.assists;
            }
        }
        
        // Update position detail options if position changed
        updatePositionDetailOptions(player.position || position);
        
        currentPlayer = { position, index: players[position].findIndex(p => p.id === player.id) };
    } else {
        // Adding new player
        title.textContent = 'Agregar Jugador';
        form.reset();
        document.getElementById('player-position').value = position;
        updatePositionDetailOptions(position);
        
        // Set fields based on position
        if (position === 'porterias') {
            // Show clean sheets, hide goals and assists
            cleanSheetsGroup.style.display = 'block';
            goalsGroup.style.display = 'none';
            assistsGroup.style.display = 'none';
        } else {
            // Hide clean sheets, show goals and assists
            cleanSheetsGroup.style.display = 'none';
            goalsGroup.style.display = 'block';
            assistsGroup.style.display = 'block';
        }
        
        currentPlayer = null;
    }
    
    modal.style.display = 'block';
}

// Close player modal
function closePlayerModal() {
    document.getElementById('player-modal').style.display = 'none';
}

// Save player (add or update)
function savePlayer() {
    const id = document.getElementById('player-id').value;
    const name = document.getElementById('player-name').value;
    const goals = parseInt(document.getElementById('player-goals').value) || 0;
    const assists = parseInt(document.getElementById('player-assists').value) || 0;
    const cleanSheets = parseInt(document.getElementById('player-clean-sheets').value) || 0;
    const rating = parseFloat(document.getElementById('player-rating').value) || 0;
    const position = document.getElementById('player-position').value;
    const positionDetail = document.getElementById('player-position-detail').value;
    const team = document.getElementById('player-team').value;
    const possession = document.getElementById('player-possession').checked;
    const pickType = document.getElementById('player-pick-type').value;

    
    // Get existing player data if editing
    let selected = false;
    if (currentPlayer) {
        const existingPlayer = players[currentPlayer.position][currentPlayer.index];
        selected = existingPlayer.selected || false;
    }
    
    let player;
    if (position === 'porterias') {
        // Special structure for goalkeepers
        player = { 
            id: id || Date.now().toString(), 
            name, 
            cleanSheets,
            rating,
            position: position,
            team: team,
            selected: selected,
            possession: possession,
            pickType: pickType
        };
    } else {
        // Regular structure for other positions
        player = { 
            id: id || Date.now().toString(), 
            name, 
            goals, 
            assists, 
            rating,
            position: position,
            positionDetail: positionDetail,
            team: team,
            selected: selected,
            possession: possession,
            pickType: pickType
        };
    }
    
    if (currentPlayer) {
        // Update existing player
        players[currentPlayer.position][currentPlayer.index] = player;
    } else {
        // Add new player
        players[position].push(player);
    }
    
    // Save to localStorage
    savePlayers();
    
    // Re-render tables
    renderAllTables();
    
    // Close modal
    closePlayerModal();
}

// Edit player
function editPlayer(position, index) {
    const player = players[position][index];
    openPlayerModal(player, position);
}

// Move player up or down in the list
function movePlayer(position, index, direction) {
    const playersArray = players[position];
    
    if (direction === 'up' && index > 0) {
        // Swap with previous player
        [playersArray[index], playersArray[index - 1]] = [playersArray[index - 1], playersArray[index]];
    } else if (direction === 'down' && index < playersArray.length - 1) {
        // Swap with next player
        [playersArray[index], playersArray[index + 1]] = [playersArray[index + 1], playersArray[index]];
    }
    
    // Save and re-render
    savePlayers();
    renderAllTables();
}

// Toggle player selection status
function togglePlayerSelection(position, index) {
    players[position][index].selected = !players[position][index].selected;
    // Automatically update possession status when selection changes
    if (players[position][index].selected) {
        players[position][index].possession = true;
    } else {
        players[position][index].possession = false;
    }
    savePlayers();
    renderAllTables();
}

// Delete player
function deletePlayer(position, index) {
    if (confirm('¿Estás seguro de que quieres eliminar este jugador?')) {
        players[position].splice(index, 1);
        savePlayers();
        renderTable(position);
    }
}

// Save players to localStorage
function savePlayers() {
    localStorage.setItem('fantaPremierPlayers', JSON.stringify(players));
}

// Load players from localStorage
function loadPlayers() {
    const savedPlayers = localStorage.getItem('fantaPremierPlayers');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        // Asegura que todos los jugadores tengan los campos nuevos
        Object.keys(players).forEach(position => {
            players[position].forEach(player => {
                if (player.selected === undefined) player.selected = false;
                if (player.possession === undefined) player.possession = false;
                // Si es portero, asegura cleanSheets
                if (position === 'porterias' && player.cleanSheets === undefined) {
                    player.cleanSheets = 0;
                }
                // Si es defensor, mediocampista o delantero, asegura goals y assists
                if (position !== 'porterias') {
                    if (player.goals === undefined) player.goals = 0;
                    if (player.assists === undefined) player.assists = 0;
                }
            });
        });
    } else {
        // Inicializa con datos de ejemplo
        players = initializeSampleData();
        savePlayers();
    }
}

let sortState = {
    porterias: { column: null, asc: true },
    defensores: { column: null, asc: true },
    mediocampistas: { column: null, asc: true },
    delanteros: { column: null, asc: true }
};

function setupSorting() {
    document.querySelectorAll('.players-table th.sortable').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', function() {
            const position = th.closest('.tab-pane').id;
            const column = th.getAttribute('data-sort');
            // Toggle asc/desc if clicking same column
            if (sortState[position].column === column) {
                sortState[position].asc = !sortState[position].asc;
            } else {
                sortState[position].column = column;
                sortState[position].asc = false; // default: descending
            }
            sortAndRender(position, column, sortState[position].asc);
        });
    });
}

function sortAndRender(position, column, asc) {
    players[position].sort((a, b) => {
        let valA = a[column] || 0;
        let valB = b[column] || 0;
        // Si es string, comparar como string
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
    });
    renderTable(position);
}

function updateTotalPlayersButton() {
    // Obtiene la pestaña activa
    const activePane = document.querySelector('.tab-pane.active');
    if (!activePane) return;
    const position = activePane.id;
    const total = players[position].length;
    const button = document.querySelector('.jugadores-total-btn');
    if (button) {
        let posicion = position.charAt(0).toUpperCase() + position.slice(1);
        button.textContent = `${posicion}: ${total}`;
    }
}

// Llama a setupSorting cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setupSorting();
});
