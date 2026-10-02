document.addEventListener('DOMContentLoaded', () => {
    const sessionForm = document.getElementById('session-form');
    const workoutName = document.getElementById('workout-name');
    const workoutDate = document.getElementById('workout-date');
    const workoutReps = document.getElementById('workout-reps');
    const workoutWeight = document.getElementById('workout-weight');
    const historyList = document.getElementById('workout-history-list');

    // Define a data atual por padrão
    if (workoutDate && !workoutDate.value) {
        workoutDate.value = new Date().toISOString().split('T')[0];
    }

    // Carrega e renderiza o histórico
    function renderWorkouts() {
        const workouts = JSON.parse(localStorage.getItem('workoutsHistory') || '[]');
        
        if (!historyList) return;

        if (workouts.length === 0) {
            historyList.innerHTML = '<div class="chart-empty">Nenhum treino registrado ainda.</div>';
            return;
        }

        // Ordena do mais recente para o mais antigo
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        historyList.innerHTML = workouts.map((item, index) => `
            <div class="list-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
                <div class="row-main">
                    <div class="row-title" style="font-weight:600;">${item.name}</div>
                    <div class="row-meta" style="font-size:12px; color:var(--text-muted, #888);">${item.date.split('-').reverse().join('/')} • ${item.reps}</div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <div class="row-value" style="font-weight:700; color:var(--neon-green, #639151);">${item.weight} kg</div>
                    <button type="button" class="btn-delete" data-index="${index}" style="background:transparent; border:none; color:#e74c3c; cursor:pointer; font-size:16px;">✕</button>
                </div>
            </div>
        `).join('');

        // Adiciona evento de remoção
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                deleteWorkout(idx);
            });
        });
    }

    function deleteWorkout(index) {
        let workouts = JSON.parse(localStorage.getItem('workoutsHistory') || '[]');
        workouts.splice(index, 1);
        localStorage.setItem('workoutsHistory', JSON.stringify(workouts));
        renderWorkouts();
    }

    // Processa o envio do formulário
    if (sessionForm) {
        sessionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = workoutName.value.trim();
            const date = workoutDate.value;
            const reps = workoutReps.value.trim();
            const weight = parseFloat(workoutWeight.value);

            if (!name || !date || !reps || isNaN(weight)) {
                alert('Por favor, preencha todos os campos corretamente.');
                return;
            }

            const newWorkout = { id: Date.now(), name, date, reps, weight };
            let workouts = JSON.parse(localStorage.getItem('workoutsHistory') || '[]');
            workouts.push(newWorkout);
            localStorage.setItem('workoutsHistory', JSON.stringify(workouts));

            // Limpa o formulário
            workoutName.value = '';
            workoutReps.value = '';
            workoutWeight.value = '';
            workoutDate.value = new Date().toISOString().split('T')[0];

            renderWorkouts();
        });
    }

    renderWorkouts();
});